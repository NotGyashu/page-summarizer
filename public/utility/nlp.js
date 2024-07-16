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

    // Call summarizeLargeText function to summarize the text
    summarizeLargeText(message.text, message.apiKey)
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

// Function to summarize large text
async function summarizeLargeText(text, apiKey) {
  const CHUNK_SIZE = 100000; // 100KB
  const chunks = splitTextIntoChunks(text, CHUNK_SIZE);
  const summaries = [];

  for (const chunk of chunks) {
    try {
      const summary = await summarizeText(chunk, apiKey);
      summaries.push(summary);
    } catch (error) {
      console.error("Error summarizing chunk:", error);
      summaries.push("Error summarizing chunk");
    }
  }

  return summaries.join("\n\n");
}

// Function to split text into chunks
function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

// Function to fetch the summary of the text using Cohere AI
async function summarizeText(text, apiKey) {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
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
        if (response.status === 429) {
          // Handle rate limit, retry after some time
          const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retries++;
          continue; // Retry the request
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("Summary generated from Cohere AI:", data.summary);
      return data.summary;
    } catch (error) {
      console.error("Error in fetching summary from Cohere AI:", error);
      throw error;
    }
  }

  // Return an empty string or handle as needed when retries exceed
  console.warn("Exceeded maximum retries for fetching summary from Cohere AI");
  return "";
}
