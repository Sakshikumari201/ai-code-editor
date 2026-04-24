const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Decision = require('../models/Decision');

router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]); // Return empty if DB not connected
        }
        const decisions = await Decision.find().sort({ createdAt: -1 }).limit(20);
        res.json(decisions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch decisions' });
    }
});

router.post('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ message: 'Success (DB not connected - not saved)' });
        }
        const decision = new Decision(req.body);
        await decision.save();
        res.status(201).json(decision);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save decision' });
    }
});

module.exports = router;
