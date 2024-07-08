console.log("Content script loaded.");

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";


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
  const textArray = await Promise.all(extractLimitedText());
  summary = textArray.join(" ");
  console.log("Text array:", textArray);
  console.log("Final summary:", summary);
  return summary;
}

function extractLimitedText() {
  return [
    extractHeadings(),
    extractSectionText(),
    extractDynamicContent(),
    extractParas(),
  ];
}

async function extractDynamicContent() {
  try {
    const element = await waitForElement(".dynamic-content");
    if (element) {
      return element.innerText.trim();
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error extracting dynamic content:", error);
    return "";
  }
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 100);
  });
}

function extractParas() {
  let text = "";
  const paragraphs = document.querySelectorAll("p");
  paragraphs.forEach((p, index) => {
    if (index < 5) {
      text += p.innerText + " ";
    }
  });
 // console.log("Paragraph text:", text);
  return text.trim();
}

function extractHeadings() {
  let text = "";
  const headings = document.querySelectorAll("h1, h2, h3");
  headings.forEach((heading) => {
    text += heading.innerText + " ";
  });
 // console.log("Headings text:", text);
  return text.trim();
}

function extractSectionText() {
  let text = "";
  const section = document.querySelector(".main-content");
  if (section) {
    text = section.innerText.trim();
  }
  //console.log("Section text:", text);
  return text;
}
