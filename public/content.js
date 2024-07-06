// content.js
// Placeholder for any content script functionality needed

// If you need to communicate between your popup and content script, you can set up message listeners.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    const bodyText = document.body.innerText;
    const summary = bodyText.split(". ").slice(0, 5).join(". ") + ".";
    sendResponse({ summary });
  }

  if (request.action === "askQuestion") {
    const question = request.question.toLowerCase();
    const bodyText = document.body.innerText;
    const sentences = bodyText.split(". ");
    const answer =
      sentences.find((sentence) => sentence.toLowerCase().includes(question)) ||
      "No answer found.";
    sendResponse({ answer });
  }
});
