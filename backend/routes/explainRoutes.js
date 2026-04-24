const express = require('express');
const router = express.Router();
const explainService = require('../services/explainService');

router.post('/code', async (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
        
        const explanation = await explainService.explainCode(code, language);
        res.json({ explanation });
    } catch (error) {
        console.error('Explanation error:', error);
        res.status(500).json({ error: 'Failed to explain code' });
    }
});

module.exports = router;
