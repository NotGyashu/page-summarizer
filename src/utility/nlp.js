// nlp.js


// import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();


const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

export async function summarizeText(text) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      inputs: text,
    },
    {
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
      },
    }
  );

  return response.data[0].summary_text;
}

export async function answerQuestion(question, context) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
    {
      inputs: {
        question: question,
        context: context,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
      },
    }
  );

  return response.data.answer;
}
