const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Helpers ----------------------------------------------------------------

// Conservative char limit for context window (~120k tokens for Gemini Flash)
const MAX_TEXT_LENGTH = 500000;
const truncateText = (text, tag) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= MAX_TEXT_LENGTH) return text;
  console.warn(`[aiSvc] ${tag}: text truncated ${text.length} -> ${MAX_TEXT_LENGTH} chars`);
  return text.slice(0, MAX_TEXT_LENGTH);
};

// Robustly parse JSON from LLM output (handles fences, surrounding prose)
const safeParseJSON = (raw, fallbackErrMsg) => {
  if (!raw || !String(raw).trim()) throw new Error(fallbackErrMsg || 'Empty AI response');
  let s = String(raw).trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const arr = s.match(/\[[\s\S]*\]/);
  const obj = s.match(/\{[\s\S]*\}/);
  if (arr) s = arr[0]; else if (obj) s = obj[0];
  try { return JSON.parse(s); } catch (e) {
    console.error('[aiSvc] JSON parse FAILED snippet:', s.slice(0, 300));
    throw new Error(`AI returned unparseable data: ${e.message}`);
  }
};

const getModel = (systemInstruction) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const config = { model: "gemini-3.6-flash" };
  if (systemInstruction) config.systemInstruction = systemInstruction;
  return genAI.getGenerativeModel(config);
};

const generateDocumentSummary = async (text) => {
  try {
    const t = truncateText(text, 'Summary');
    if (!t) throw new Error('No readable text available to summarize.');
    const model = getModel();
    const prompt = `Please provide a concise, structural summary of the following document text. Focus on the main ideas, key arguments, and essential takeaways.\n\nText:\n${t}`;
    console.log('[aiSvc] Generating summary...');
    const result = await model.generateContent(prompt);
    const out = result.response.text();
    console.log('[aiSvc] Summary OK (' + out.length + ' chars)');
    return out;
  } catch (e) {
    console.error('[aiSvc] Summary FAILED:', e.message);
    throw new Error(`Summary generation failed: ${e.message}`);
  }
};

const explainConcept = async (concept, text) => {
  try {
    const t = truncateText(text, `Explain:${concept}`);
    const model = getModel();
    const prompt = `Explain the concept of "${concept}" in-depth, specifically using the context provided by the following text. If the text does not contain enough context, explain it generally but note the lack of context.\n\nContext:\n${t}`;
    console.log(`[aiSvc] Explaining concept "${concept}"...`);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error('[aiSvc] Explain FAILED:', e.message);
    throw new Error(`Explanation failed: ${e.message}`);
  }
};

const generateFlashcards = async (text, count = 10) => {
  try {
    const t = truncateText(text, `Flashcards(${count})`);
    if (!t) throw new Error('No readable text available for flashcard generation.');
    const n = Math.min(Math.max(parseInt(count, 10) || 10, 1), 50);
    const model = getModel();
    const userPrompt =
      `Generate exactly ${n} high-quality flashcards from the document text below.\n` +
      `Return ONLY a valid JSON array with NO markdown, NO prose, NO code fences.\n` +
      `Each object must have only two string keys: "front" (question/term) and "back" (answer/definition).\n` +
      `Example: [{"front":"What is X?","back":"X is Y."}]\n\n` +
      `DOCUMENT TEXT:\n${t}`;

    console.log(`[aiSvc] Generating ${n} flashcards...`);

    // Strategy A: try mimeType JSON (works in SDK 0.24; no Type enum which is the bug source)
    let raw;
    try {
      const r = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });
      raw = r.response.text();
    } catch (mimeTypeErr) {
      console.warn('[aiSvc] JSON mimeType failed, falling back to raw prompt...', mimeTypeErr.message);
      const r2 = await model.generateContent(userPrompt);
      raw = r2.response.text();
    }

    const cards = safeParseJSON(raw, 'Flashcards: empty response');
    if (!Array.isArray(cards)) throw new Error('Flashcards: AI did not return an array.');

    const clean = cards
      .filter(c => c && typeof c.front === 'string' && typeof c.back === 'string')
      .map(c => ({ front: c.front.trim(), back: c.back.trim() }))
      .filter(c => c.front.length && c.back.length);

    console.log(`[aiSvc] Flashcards OK: ${clean.length}/${cards.length} valid`);
    if (clean.length === 0) throw new Error('Flashcards: AI response had 0 valid cards.');
    return clean;
  } catch (e) {
    console.error('[aiSvc] Flashcards FAILED:', e.message);
    throw new Error(`Flashcard generation failed: ${e.message}`);
  }
};

const generateQuiz = async (text, numQuestions = 5) => {
  try {
    const t = truncateText(text, `Quiz(${numQuestions}q)`);
    if (!t) throw new Error('No readable text available for quiz generation.');
    const n = Math.min(Math.max(parseInt(numQuestions, 10) || 5, 1), 20);
    const model = getModel();
    const userPrompt =
      `Generate a multiple-choice quiz with exactly ${n} questions from the document text below.\n` +
      `Return ONLY a valid JSON array with NO markdown, NO prose, NO code fences.\n` +
      `Each object must have:\n` +
      `  "question" (string),\n` +
      `  "options" (array of exactly 4 strings),\n` +
      `  "correctAnswer" (string - must EXACTLY match one option string),\n` +
      `  "explanation" (string - short explanation why the answer is correct).\n\n` +
      `DOCUMENT TEXT:\n${t}`;

    console.log(`[aiSvc] Generating quiz (${n}q)...`);

    let raw;
    try {
      const r = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });
      raw = r.response.text();
    } catch (mimeTypeErr) {
      console.warn('[aiSvc] JSON mimeType failed for quiz, falling back...', mimeTypeErr.message);
      const r2 = await model.generateContent(userPrompt);
      raw = r2.response.text();
    }

    const qs = safeParseJSON(raw, 'Quiz: empty response');
    if (!Array.isArray(qs)) throw new Error('Quiz: AI did not return an array.');

    const clean = qs
      .map(q => {
        if (!q || typeof q.question !== 'string') return null;
        if (!Array.isArray(q.options) || q.options.length < 2) return null;
        if (typeof q.correctAnswer !== 'string') return null;
        const opts = q.options.filter(o => typeof o === 'string').map(o => o.trim()).slice(0, 4);
        let ans = q.correctAnswer.trim();
        if (!opts.includes(ans)) {
          const loose = opts.find(o => o.toLowerCase() === ans.toLowerCase());
          if (loose) ans = loose; else return null;
        }
        return {
          question: q.question.trim(),
          options: opts,
          correctAnswer: ans,
          explanation: (q.explanation || '').trim(),
        };
      })
      .filter(q => q && q.options.length >= 2 && q.question.length > 0);

    console.log(`[aiSvc] Quiz OK: ${clean.length}/${qs.length} valid questions`);
    if (clean.length === 0) throw new Error('Quiz: AI response had 0 valid questions.');
    return clean;
  } catch (e) {
    console.error('[aiSvc] Quiz FAILED:', e.message);
    throw new Error(`Quiz generation failed: ${e.message}`);
  }
};

const processDocumentChat = async (chatHistory, userQuery, documentContext) => {
  try {
    const ctx = truncateText(documentContext, 'ChatContext');

    // Build model WITHIN the model, NOT startChat() — this is the bug: startChat() options
    // in SDK 0.24 does not reliably accept systemInstruction. We also ensure
    // the model constructor does (and it's the canonical place for it anyway).
    const systemInstruction =
      `You are an accurate, helpful learning assistant. Answer the user's questions using ONLY using the DOCUMENT CONTEXT below. ` +
      `If the context clearly and honestly say so, and answer with the full answer is not in the context, say so honestly, then ` +
      `but still help if you can provide useful.\n\nDOCUMENT CONTEXT:\n${ctx}`;
    const model = getModel(systemInstruction);

    // Sanitize history (map roles, filter junk, limit depth)
    const formattedHistory = (chatHistory || [])
      .filter(m => m && typeof m.text === 'string' && m.text.trim())
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }))
      .filter(m => m.role === 'user' || m.role === 'model');
    if (formattedHistory.length > 40) {
      console.warn(`[aiSvc] Chat history trimmed ${formattedHistory.length} -> 40 messages`);
      formattedHistory.splice(0, formattedHistory.length - 40);
    }

    console.log('[aiSvc] Chat query:', String(userQuery || '').slice(0, 80));
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userQuery);
    const out = result.response.text();
    console.log('[aiSvc] Chat reply OK (' + out.length + ' chars)');
    return out;
  } catch (e) {
    console.error('[aiSvc] Chat FAILED:', e.message);
    throw new Error(`Chat request failed: ${e.message}`);
  }
};

module.exports = {
  generateDocumentSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  processDocumentChat
};
