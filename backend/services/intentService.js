const { callLLM } = require('./llm');
const diff = require('diff');
const Decision = require('../models/Decision');
const mongoose = require('mongoose');

async function processIntent(code, intent, language = 'javascript') {
    console.log('🔄 Processing Intent:', intent);
    
    // Fetch past decisions for Contextual Memory
    let pastContext = "";
    try {
        if (mongoose.connection.readyState === 1) {
            const history = await Decision.find({ status: 'applied' }).sort({ createdAt: -1 }).limit(5);
            if (history.length > 0) {
                pastContext = history.map(h => `- Intent: ${h.intent}\n  Reasoning: ${h.reasoning}`).join('\n');
            }
        }
    } catch (err) {
        console.warn('Could not fetch past decisions for context:', err.message);
    }

    const prompt = `
    You are an expert ${language} Senior Developer. 
    User Intent: ${intent}
    
    Current Code Content:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Persistent Decision Memory (Past changes in this session):
    ${pastContext || "No past decisions recorded yet."}
    
    Your Tasks:
    1. Act like a reasoned Senior Developer.
    2. Create a structured Engineering Plan for the change.
    3. Analyze if the intent conflicts with past decisions.
    4. Provide the updated code.
    5. Provide a technical reasoning for the change.
    
    Return the response in JSON format:
    {
        "plan": "Step-by-step engineering plan...",
        "updatedCode": "...",
        "reasoning": "Deep technical reasoning...",
        "warnings": "Optional technical warnings or constraints...",
        "summary": "Short summary of changes"
    }
    `;

    try {
        const responseText = await callLLM(prompt, 'json');
        console.log('✅ LLM Response received');
        const result = JSON.parse(responseText);
        
        // Generate diff
        console.log('🔄 Generating diff...');
        let changes = '';
        try {
            const updatedCode = String(result.updatedCode || '');
            changes = diff.createPatch('code', code, updatedCode);
        } catch (diffErr) {
            console.error('❌ Diff Error:', diffErr);
            changes = '--- code\n+++ code\n@@ -1 +1 @@\n- ' + code + '\n+ ' + result.updatedCode;
        }
        
        return {
            ...result,
            diff: changes
        };
    } catch (error) {
        console.error('❌ Service Error:', error);
        throw error;
    }
}

module.exports = { processIntent };
