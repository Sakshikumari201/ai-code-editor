const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
    intent: String,
    oldCode: String,
    newCode: String,
    reasoning: String,
    language: String,
    status: { type: String, enum: ['applied', 'rejected'], default: 'applied' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Decision', decisionSchema);
