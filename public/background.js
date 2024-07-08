chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded.");
});

function injectScripts(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["purify.min.js", "readability.js", "content.js"],
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

chrome.action.onClicked.addListener(async (tab) => {
  if (/^http/.test(tab.url)) {
    try {
      await injectScripts(tab.id);
      console.log("Content script injected.");
      const response = await sendMessageToContentScript(tab.id, {
        type: "summarizePage",
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "summarizePage") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        await injectScripts(tabs[0].id);
        const response = await sendMessageToContentScript(tabs[0].id, {
          type: "summarizePage",
        });
        console.log(
          "Received response to background from content script:",
          response
        );
        //send this response.summary to for nlp
        // response from there should br sent to popup
        sendResponse({ summary: response.summary });
      } catch (error) {
        console.error(
          "Error sending message from background to content script:",
          error
        );
        sendResponse({ summary: "Error in summarizing" });
      }
    });
    return true; // Indicates that we will respond asynchronously
  }


// Listener for answering questions
  if (message.type === "answerQuestion") {
    console.log("Question received:", message.question);
    // Placeholder response
    const answer = "Here is the answer";
    sendResponse({ answer });
    return true; // Indicates that we will respond asynchronously
  }
});
