const { callLLM } = require('./llm');

async function explainCode(code, language = 'javascript') {
    const prompt = `
    Explain the following ${language} code in detail but concisely.
    Focus on logic, potential issues, and optimization possibilities.
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Provide your explanation in beautifully formatted Markdown.
    `;

    try {
        const explanation = await callLLM(prompt);
        return explanation;
    } catch (error) {
        console.error('Explanation LLM Error:', error);
        throw error;
    }
}

module.exports = { explainCode };
