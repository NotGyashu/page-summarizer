import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const handleSend = () => {
    if (question.trim() === "") return;

    // Add the question to the chat log with a placeholder for the answer
    setChatLog([...chatLog, { question: question, answer: "" }]);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { type: "answerQuestion", question },
        (response) => {
          console.log("Answer from background script:", response);
          if (response && response.answer) {
            // Update the last entry in the chat log with the received answer
            setChatLog((prevChatLog) => {
              const updatedChatLog = [...prevChatLog];
              updatedChatLog[updatedChatLog.length - 1].answer =
                response.answer;
              return updatedChatLog;
            });
          }
        }
      );
    });

    setQuestion(""); // Clear the input field after sending
  };

  return (
    <div>
      <div className="max-h-[300px]  overflow-y-scroll scrollbar-hide p-3 flex flex-col gap-4">
        {chatLog.map((entry, index) => (
          <div key={index}>
            <p className="">You: {entry.question}</p>
            {entry.answer && (
              <p className="">Bot: {entry.answer}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex w-full p-1 bg-white rounded-full border justify-center items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="border px-2 py-1 focus:outline-none rounded-full text-sm w-full text-black flex-grow"
        />
        <SendIcon
          onClick={handleSend}
          className="mx-2 text-green-400 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Chat;
