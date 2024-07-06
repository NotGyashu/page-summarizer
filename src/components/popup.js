import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Popup = () => {
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [expand, setExpand] = useState(false);

  const handleSummarize = () => {
    setExpand(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: summarizePage,
        },
        (results) => {
          setSummary(results[0].result);
        }
      );
    });
  };

  const handleAsk = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: askQuestion,
          args: [question],
        },
        (results) => {
          setAnswer(results[0].result);
        }
      );
    });
  };

  const handleClose = () => {
    setExpand(false); // Reset the expand state to false
    setSummary(""); // Clear the summary
    setQuestion(""); // Clear the question input
    setAnswer(""); // Clear the answer
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
          <motion.div
            className="inset-0 z-50 flex items-center justify-center"
           
          >
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
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question"
                  className="border px-2 py-1 rounded mb-4 w-full"
                />
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleAsk}
                >
                  Ask Question
                </button>
                {answer && <p className="mt-4">{answer}</p>}
              </div>
            </div>
          </motion.div>
        )}
  
    </div>
  );
};

const summarizePage = () => {
  const bodyText = document.body.innerText;
  return bodyText.split(". ").slice(0, 5).join(". ") + ".";
};

const askQuestion = (question) => {
  const bodyText = document.body.innerText;
  const sentences = bodyText.split(". ");
  return (
    sentences.find((sentence) =>
      sentence.toLowerCase().includes(question.toLowerCase())
    ) || "No answer found."
  );
};

export default Popup;
