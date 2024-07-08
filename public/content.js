import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

// Content script
console.log("content script is loaded");
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
    const doc = new JSDOM(document.documentElement.outerHTML).window.document;
    const reader = new Readability(doc);
    const article = reader.parse();
    summary = article.textContent;
  } catch (error) {
    console.error("Error summarizing page:", error);
    summary = "Error in summarizing";
  }
  console.log("Final summary:", summary);
  return summary;
}
