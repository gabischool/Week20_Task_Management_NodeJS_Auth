import OpenAI from "openai";
const OPENAI_KEY = process.env.OPENAI_KEY || "your-openai-key";


const client = new OpenAI({
  apiKey: OPENAI_KEY,
});

export { client };