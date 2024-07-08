chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "summarizePage" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error sending message to content script:",
        chrome.runtime.lastError
      );
    } else {
      console.log("Summary received:", response.summary);
    }
  });
});


// Example: Send a message to the content script for debugging purposes
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(
    tab.id,
    { type: "debugMessage", message: "from background" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending debug message to content script:",
          chrome.runtime.lastError
        );
      } else {
        console.log("Debug message received by content script.");
      }
    }
  );
});
