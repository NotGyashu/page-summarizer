chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded.");
});

function injectContentScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["content.js"],
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

function isValidUrl(url) {
  return url && /^http/.test(url);
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isValidUrl(tab.url)) {
    try {
      await injectContentScript(tabId);
      console.log("Content script injected.");
    } catch (error) {
      console.error("Error injecting content script:", error);
    }
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (isValidUrl(tab.url)) {
    try {
      await injectContentScript(tab.id);
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
  } else {
    console.warn("Invalid tab URL:", tab.url);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "summarizePage") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0] && isValidUrl(tabs[0].url)) {
        try {
          await injectContentScript(tabs[0].id);
          const response = await sendMessageToContentScript(tabs[0].id, {
            type: "summarizePage",
          });
          console.log(
            "Received response to background from content script:",
            response
          );
          sendResponse({ summary: response.summary });
        } catch (error) {
          console.error(
            "Error sending message from background to content script:",
            error
          );
          sendResponse({ summary: "Error in summarizing" });
        }
      } else {
        console.warn("Invalid tab URL or no active tab found.");
        sendResponse({ summary: "Error in summarizing" });
      }
    });
    return true; // Indicates that we will respond asynchronously
  }
});
