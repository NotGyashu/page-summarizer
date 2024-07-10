chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script loaded.");
});
// background.js

//const { summarizeText, answerQuestion } = require('./nlp.js');

function injectScripts(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["libs/purify.min.js", "libs/readability.js", "content.js"], 
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
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tabId = tabs[0].id;
        await injectScripts(tabId);
        const response = await sendMessageToContentScript(tabId, {
          type: "summarizePage",
        });
        console.log(
          "Received response to background from content script:",
          response
        );

        //const summary = await summarizeText(response.text);
        sendResponse({ summary:response.summary });
      });
    } catch (error) {
      console.error("Error during summarization:", error);
      sendResponse({ summary: "Error in summarizing" });
    }
    return true; // Indicates that we will respond asynchronously
  }

  if (message.type === "answerQuestion") {
    try {
      const answer = "here is the ans"
      //await answerQuestion(message.question, message.context);
      sendResponse({ answer });
    } catch (error) {
      console.error("Error during question answering:", error);
      sendResponse({ answer: "Error in answering question" });
    }
    return true; // Indicates that we will respond asynchronously
  }
});