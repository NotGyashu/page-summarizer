// Listener when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded.");
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    try {
      await injectScripts(tabId);
      console.log("Content script injected.");
    } catch (error) {
      console.error("Error injecting content script:", error);
    }
  }
});

// Listener for extension action click
chrome.action.onClicked.addListener(async (tab) => {
  if (/^http/.test(tab.url)) {
    try {
      await injectScripts(tab.id);
      console.log("Content script injected.");
      const response = await sendMessageToContentScript(tab.id, {
        type: "extractPage",
      });
      console.log(
        "Received response to background from content script:",
        response
      );
    } catch (error) {
      console.error(
        "Error sending message from background to content script:",
        error
      );
    }
  }
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
         const match = text.match(/const\s+Key\s*=\s*['"]([^'"]+)['"]/i);
       
        resolve(match ? match[1] : null);
      })
      .catch((error) => {
        reject(error);
      });
  });
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
     
        const summary = await sendMessageToNLP(tabId, {
          text: response.text.slice(0, 100000),
          apiKey: apiKey,
        });
        sendResponse({ summary });
      } catch (error) {
        console.error(
          "Error during sending text to nlp from background",
          error
        );
        sendResponse({
          summary: "Error in sending text to nlp from background",
        });
      }
    });
    return true; // Indicates that we will respond asynchronously
  }

  if (message.type === "answerQuestion") {
    // Uncomment and implement this part as needed
    // try {
    //   const answer = await answerQuestion(message.question, message.context);
    //   sendResponse({ answer });
    // } catch (error) {
    //   console.error("Error during question answering:", error);
    //   sendResponse({ answer: "Error in answering question" });
    // }
    return true; // Indicates that we will respond asynchronously
  }
});
