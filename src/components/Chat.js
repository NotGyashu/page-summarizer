// Chat.js

import React, { useState } from "react";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSend = () => {
    setAnswer(`You asked: ${question}`);

    // Send the question to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { type: "answerQuestion", question },
        (response) => {
          console.log("Answer from content script:", response);
          if (response && response.answer) {
            setAnswer(response.answer);
          }
        }
      );
    });

    setQuestion(""); // Clear the input field after sending
  };

  return (
    <div>
      <div>{answer && <p className="mt-4">{answer}</p>}</div>
      <div className="flex w-full p-1">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="border px-2 py-1 text-black rounded mb-4 w-full flex-grow"
        />
        <button onClick={handleSend} className="ml-2">
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;
