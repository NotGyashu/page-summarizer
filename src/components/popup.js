import React, { useState, useEffect } from "react";
import Chat from "./Chat.js";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const Popup = () => {
  const [summaries, setSummaries] = useState([]);
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResponse = (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending message from popup to background script:",
          chrome.runtime.lastError.message
        );
        setSummaries((prevSummaries) => [
          ...prevSummaries,
          "Error in extracting the page in popup",
        ]);
        setIsLoading(false);
      } else {
        console.log(
          "Received response to popup from background script:",
          response
        );
        if(response.summary && response.summary != "" )
        setSummaries((prevSummaries) => [...prevSummaries, response.summary]);
        if (response.isFinal) {
          setIsLoading(false); // Stop loading when all summaries are received
        }
      }
    };

    if (expand) {
      chrome.runtime.onMessage.addListener(handleResponse);
    }

    return () => {
      chrome.runtime.onMessage.removeListener(handleResponse);
    };
  }, [expand]);

  const handleSummarize = () => {
    setExpand(true);
    setIsLoading(true);
    chrome.runtime.sendMessage({ type: "extractPage" });
  };

  const handleClose = () => {
    setExpand(false); // Reset the expand state to false
    setSummaries([]); // Clear the summaries
  };

  return (
    <div className="overflow-hidden">
      <button
        onClick={handleSummarize}
        className={`${
          expand
            ? "hidden"
            : "font-serif text-white p-1 text-xs flex items-center justify-center rounded bg-custom-gradient1 w-[80px]"
        }`}
      >
        Quick Read
      </button>

      {expand && (
        <div className="inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-custom-gradient2 text-white w-[800px] rounded-lg p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">Quick Read</h1>
              <div>
                <button
                  className="bg-orange-500 text-white px-2 py-1 rounded mr-2"
                  onClick={handleClose}
                >
                  Minimize
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </div>
            <div>
              {isLoading && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                </Box>
              )}
              {summaries.length > 0 && (
                <ul className="mb-4 border-2 flex flex-col gap-2 p-2 rounded-md text-sm overflow-y-scroll max-h-[300px] list-inside list-disc scrollbar-hide">
                  {summaries.map((summary, index) => (
                    <li key={index}>{summary}</li>
                  ))}
                </ul>
              )}
            </div>
            <Chat />
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
