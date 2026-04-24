const axios = require('axios');
const { OpenAI } = require('openai');

async function callLLM(prompt, format = 'text') {
    // Try Gemini REST v1
    if (process.env.GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const body = {
                contents: [{ parts: [{ text: prompt }] }]
            };
            const response = await axios.post(url, body);
            let text = response.data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return text;
        } catch (err) {
            console.error('❌ Gemini v1 REST Error:', err.response?.data?.error?.message || err.message);
            console.log('🔄 Trying fallback options...');
        }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: format === 'json' ? { type: "json_object" } : { type: "text" }
            });
            return response.choices[0].message.content;
        } catch (err) {
            console.error('❌ OpenAI Error:', err.message);
        }
    }

    // Dummy Response if all else fails
    console.warn('⚠️ Using fallback mock response.');
    if (format === 'json') {
        return JSON.stringify({
            plan: "1. Analyze current code structure.\n2. Apply requested intent in a safe manner.",
            updatedCode: "// AI Offline\nconsole.log('Using placeholder response');",
            reasoning: "Service unavailable.",
            warnings: "This is a fallback response and has not been analyzed by a live LLM.",
            summary: "Placeholder changes."
        });
    }
    return "The AI service is currently unavailable. Please verify your keys.";
}

module.exports = { callLLM };
