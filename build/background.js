chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Script injection failed: ", chrome.runtime.lastError.message);
    } else {
      console.log("Content script injected");
    }
  });
});
