const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Testing Key:", key ? "FOUND" : "NOT FOUND");
  
  const genAI = new GoogleGenerativeAI(key);
  
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      console.log(`✅ Success with ${modelName}:`, result.response.text().substring(0, 50));
      return modelName;
    } catch (err) {
      console.error(`❌ Failed with ${modelName}:`, err.message);
    }
  }
}

test();
