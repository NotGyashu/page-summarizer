import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chat from "./Chat";

const Popup = () => {
  const [summary, setSummary] = useState("");
  const [expand, setExpand] = useState(false);

 const handleSummarize = () => {
   setExpand(true);
   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
     chrome.runtime.sendMessage({ type: "summarizePage" }, (response) => {
       if (chrome.runtime.lastError) {
         console.error(
           "Error summarizing page:",
           chrome.runtime.lastError.message
         );
         setSummary("Error summarizing page.");
       } else if (response) {
         setSummary(response.summary);
       } else {
         console.error("No response received");
         setSummary("No response received");
       }
     });
   });
 };


  const handleClose = () => {
    setExpand(false); // Reset the expand state to false
    setSummary(""); // Clear the summary
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

      <AnimatePresence>
        {expand && (
          <motion.div className="inset-0 z-50 flex items-center justify-center">
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
                {summary && (
                  <p className="mb-4 border-2 rounded-md p-3 overflow-y-scroll max-h-[400px] scrollbar-hide">
                    {summary}
                  </p>
                )}
                <Chat />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popup;
