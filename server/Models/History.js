const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    media: { type: String }, // URL or media description
    description: { type: String, required: true }
});

const History = mongoose.model('History', HistorySchema);

module.exports = History