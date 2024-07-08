// Assuming readability.js and dompurify.min.js are already loaded
console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script from background", message);

  if (message.type === "summarizePage") {
    summarizePage()
      .then((summary) => {
        console.log("Summary generated:", summary);
        sendResponse({ summary });
      })
      .catch((error) => {
        console.error("Error summarizing page:", error);
        sendResponse({ summary: "Error in summarizing" });
      });
    return true; // Indicates that we will respond asynchronously
  }
});

async function summarizePage() {
  let summary = "";
  try {
    // Clone the document to avoid modifying the original DOM
    const documentClone = document.cloneNode(true);

    // Create a Readability instance
    const reader = new Readability(documentClone);

    // Parse the document
    const article = reader.parse();

    if (article) {
      // Sanitize the extracted content
      summary = DOMPurify.sanitize(article.textContent);
    } else {
      summary = "Could not extract readable content.";
    }
  } catch (error) {
    console.error("Error summarizing page:", error);
    summary = "Error in summarizing";
  }

  console.log("Final summary:", summary);
  return summary;
}
