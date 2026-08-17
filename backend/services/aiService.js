const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

const generateDocumentSummary = async (text) => {
  const model = getModel();
  const prompt = `Please provide a concise, structural summary of the following document text. Focus on the main ideas, key arguments, and essential takeaways.\n\nText:\n${text}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const explainConcept = async (concept, text) => {
  const model = getModel();
  const prompt = `Explain the concept of "${concept}" in-depth, specifically using the context provided by the following text. If the text does not contain enough context, explain it generally but note the lack of context.\n\nContext:\n${text}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const generateFlashcards = async (text, count = 10) => {
  const model = getModel();
  const prompt = `You are a learning assistant. Generate exactly ${count} flashcards based on the provided text. Return the result strictly as a JSON array of objects, where each object has a "front" (the question or term) and a "back" (the answer or definition). Do not include markdown formatting like \`\`\`json.\n\nText:\n${text}`;
  
  const result = await model.generateContent(prompt);
  let responseText = result.response.text().trim();
  
  // Clean up potential markdown formatting
  if (responseText.startsWith('\`\`\`json')) {
    responseText = responseText.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
  } else if (responseText.startsWith('\`\`\`')) {
    responseText = responseText.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
  }
  
  return JSON.parse(responseText);
};

const generateQuiz = async (text, numQuestions = 5) => {
  const model = getModel();
  const prompt = `You are a learning assistant. Generate a multiple-choice quiz with exactly ${numQuestions} questions based on the provided text. Return strictly as a JSON array of objects. Each object must have: "question" (string), "options" (array of 4 strings), "correctAnswer" (string, must exactly match one of the options), and "explanation" (string).\n\nText:\n${text}`;
  
  const result = await model.generateContent(prompt);
  let responseText = result.response.text().trim();
  
  // Clean up potential markdown formatting
  if (responseText.startsWith('\`\`\`json')) {
    responseText = responseText.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
  } else if (responseText.startsWith('\`\`\`')) {
    responseText = responseText.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
  }
  
  return JSON.parse(responseText);
};

const processDocumentChat = async (chatHistory, userQuery, documentContext) => {
  const model = getModel();
  
  // Format the history for the Gemini model (requires role 'user' or 'model' and parts array)
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = model.startChat({
    history: formattedHistory,
  });

  const prompt = `Context from document:\n${documentContext}\n\nUser Question:\n${userQuery}\n\nPlease answer the user's question accurately using the document context provided above.`;
  
  const result = await chat.sendMessage(prompt);
  return result.response.text();
};

module.exports = {
  generateDocumentSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  processDocumentChat
};
