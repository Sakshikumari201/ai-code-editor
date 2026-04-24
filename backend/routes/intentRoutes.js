const express = require('express');
const router = express.Router();
const intentService = require('../services/intentService');

router.post('/process', async (req, res) => {
    console.log('📥 POST /api/intent/process');
    console.log('📦 Body:', req.body);
    try {
        const { code, intent, language } = req.body;
        if (!code || !intent) {
            return res.status(400).json({ error: 'Code and intent are required' });
        }
        
        const result = await intentService.processIntent(code, intent, language);
        res.json(result);
     } catch (error) {
        console.error('❌ Intent processing error:', error);
        res.status(500).json({ error: error.message || 'Failed to process intent' });
    }
});

module.exports = router;
