const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function list() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

list();
