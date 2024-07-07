chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "summarizePage") {
    summarizePage()
      .then((summary) => {
        sendResponse({ summary });
      })
      .catch((error) => {
        console.error("Error summarizing page:", error);
        sendResponse({ summary: "" });
      });
  }
});


async function summarizePage() {
  let summary = "";
  const textArray = await Promise.all(extractLimitedText());
  summary = textArray.join(" ");
  return summary;
}

function answerQuestion(question) {
  return `Answering question: ${question}`;
}

function extractLimitedText() {
  return [
    extractHeadings(),
    extractSectionText(),
    extractDynamicContent(),
    extractParas(),
  ];
}

function extractDynamicContent() {
  return waitForElement(".dynamic-content")
    .then((element) => {
      if (element) {
        return element.innerText.trim();
      } else {
        return "";
      }
    })
    .catch((error) => {
      console.error("Error extracting dynamic content:", error);
      return "";
    });
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
  return text.trim();
}

function extractHeadings() {
  let text = "";
  const headings = document.querySelectorAll("h1, h2, h3");
  headings.forEach((heading) => {
    text += heading.innerText + " ";
  });
  return text.trim();
}

function extractSectionText() {
  let text = "";
  const section = document.querySelector(".main-content");
  if (section) {
    text = section.innerText.trim();
  }
  return text;
}
