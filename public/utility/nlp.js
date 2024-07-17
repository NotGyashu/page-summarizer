chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "summarizeText") {
    summarizeTextWithDelay(message.text, message.apiKey)
      .then((summary) => {
        console.log("Summary generated from Cohere AI:", summary);
        sendResponse({ summary });
      })
      .catch((error) => {
        console.error("Error summarizing text with Cohere AI:", error);
        sendResponse({ summary: "" });
      });
    return true; // Indicates that we will respond asynchronously
  }
});

async function summarizeTextWithDelay(text, apiKey) {
  try {
    const summary = await summarizeText(text, apiKey);
    await delay(500); // Wait for 0.5 seconds
    return summary;
  } catch (error) {
    console.error("Error in fetching summary from Cohere AI:", error);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function summarizeText(text, apiKey) {
  try {
    const response = await fetch("https://api.cohere.ai/v1/summarize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        length: "auto",
        format: "paragraph",
        model: "summarize-xlarge",
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error in fetching summary from Cohere AI:", error);
    throw error;
  }
}
