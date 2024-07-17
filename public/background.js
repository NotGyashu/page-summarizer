// Listener when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded.");
});

// Function to inject scripts into tabs
async function injectScripts(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: [
          "libs/purify.min.js",
          "libs/readability.js",
          "content.js",
          "utility/nlp.js",
          "utility/setapi.js",
        ],
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          console.log("Scripts injected successfully.");
          resolve();
        }
      }
    );
  });
}

// Function to send message to content script
async function sendMessageToContentScript(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(response);
      }
    });
  });
}

// Fetch API key from setapi.js
function fetchApiKey() {
  return new Promise((resolve, reject) => {
    fetch(chrome.runtime.getURL("utility/setapi.js"))
      .then((response) => response.text())
      .then((text) => {
        // Extract API key from the script content
        const match = text.match(/const\s+codeKey\s*=\s*['"]([^'"]+)['"]/i);
        resolve(match ? match[1] : null);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Function to send chunk to nlp.js and handle response
async function sendChunkToNLP(tabId, chunk, apiKey) {
  try {
    const summary = await sendMessageToNLP(tabId, {
      text: chunk,
      apiKey: apiKey,
    });
    console.log("Received response to background from nlp:", summary);
    chrome.runtime.sendMessage({ summary });
  } catch (error) {
    console.error("Error sending chunk to NLP:", error);
  }
}

// Function to send message to nlp.js
async function sendMessageToNLP(tabId, message) {
  return new Promise((resolve, reject) => {
    // Once nlp.js is injected, send the message
    chrome.tabs.sendMessage(
      tabId,
      { type: "summarizeText", text: message.text, apiKey: message.apiKey },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(response.summary);
        }
      }
    );
  });
}

// Listener for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "extractPage") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0].id;
      try {
        await injectScripts(tabId);
        const response = await sendMessageToContentScript(tabId, {
          type: "extractPage",
        });
        console.log(
          "Received response to background from content script:",
          response
        );
        const apiKey = await fetchApiKey();
        let i;

        // Send 100000 char to nlp to summarize
        for (i = 0; i < response.text.length; i += 50000) {
          const chunk = response.text.slice(i, i + 50000);
          await sendChunkToNLP(tabId, chunk, apiKey);
        }

        // Handle the remaining text if any (less than 100,000 characters)
        const remainingText = response.text.slice(i);
        if (remainingText.length > 0) {
          await sendChunkToNLP(tabId, remainingText, apiKey);
        }

        // Send a final message to indicate completion
        chrome.runtime.sendMessage({ isFinal: true });
      } catch (error) {
        console.error(
          "Error during sending text to nlp from background",
          error
        );
        chrome.runtime.sendMessage({
          summary: "Error in sending text to nlp from background",
          isFinal: true,
        });
      }
    });n
    return true; // Indicates that we will respond asynchronously
  }
});
