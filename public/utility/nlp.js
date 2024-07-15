// nlp.js

// Message listener for receiving text to summarize
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "summarizeText") {
    let isProcessing = true;
    // Function to send status update
    function sendStatusUpdate() {
      if (isProcessing) {
        chrome.runtime.sendMessage({
          type: "processingUpdate",
          status: "Processing...",
        });
      }
    }

    // Start sending periodic status updates
    const statusInterval = setInterval(sendStatusUpdate, 5000); // Send every 5 seconds

    // Call summarizeText with the text from the message
    summarizeText(message.text,message.apiKey)
      .then((summary) => {
        console.log("Summary generated from Cohere AI:", summary);
        clearInterval(statusInterval); // Clear interval when done
        isProcessing = false;
        sendResponse({ summary });
      })
      .catch((error) => {
        console.error("Error summarizing text with Cohere AI:", error);
        clearInterval(statusInterval); // Clear interval when done
        isProcessing = false;
        sendResponse({ summary: "Error in summarizing text with Cohere AI" });
      });

    return true; // Indicates that we will respond asynchronously
  }
});

// Function to fetch the summary of the text using Cohere AI
async function summarizeText(text, apiKey) {
  try {
    console.log(apiKey);
    console.log(text);
    const response = await fetch("https://api.cohere.ai/v1/summarize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        length: "medium",
        format: "paragraph",
        model: "summarize-xlarge",
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Summary generated from Cohere AI:", data.summary);
    return data.summary;
  } catch (error) {
    console.error("Error in fetching summary from Cohere AI:", error);
    throw error;
  }
}
