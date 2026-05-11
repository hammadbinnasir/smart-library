const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  
  const modelName = "gemini-3-flash-preview";
  
  try {
    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hi");
    console.log(`✅ Success with ${modelName}:`, result.response.text());
  } catch (err) {
    console.error(`❌ Failed with ${modelName}:`, err.message);
  }
}

test();
