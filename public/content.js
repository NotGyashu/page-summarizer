// Assuming readability.js and dompurify.min.js are already loaded
console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "extractPage") {
    extractPage()
      .then((text) => {
        console.log("extraction Done:", text.trim());
        sendResponse({ text });
      })
      .catch((error) => {
        console.error("Error extracting page: in content", error);
        sendResponse({ text: "Error in extracting in content" });
      });
    return true; // Indicates that we will respond asynchronously
  }
});

async function extractPage() {
  let text = "";
  try {
    // Clone the document to avoid modifying the original DOM
    const documentClone = document.cloneNode(true);

    // Create a Readability instance
    const reader = new Readability(documentClone);

    // Parse the document
    const article = reader.parse();

    if (article) {
      // Sanitize the extracted content
      text = DOMPurify.sanitize(article.textContent);
    } else {
      text = "Could not extract readable content. is the page too short? ";
    }
  } catch (error) {
    console.error("Error in extracting page using readibility ", error);
    text = "Error in extracting using readibility";
  }

  //console.log("Final text:", text);
  return text.trim();
}
