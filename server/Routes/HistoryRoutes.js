const express = require('express');
const History = require('../Models/History');
const User = require('../Models/User'); // Unified User model

const router = express.Router();

// POST create a new history and associate it with a patient
router.post('/add-history/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const { title, media, description } = req.body;

    try {
        // Validate the user as a patient 
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'Patient') {
            return res.status(404).json({ message: "Patient not found or invalid role" });
        }

        // Create a new history record
        const newHistory = new History({ title, media, description });
        const savedHistory = await newHistory.save();

        // Associate the history with the patient
        patient.history.push(savedHistory._id);
        await patient.save();

        res.status(201).json({ message: "History added successfully", history: savedHistory });
    } catch (err) {
        res.status(400).json({ message: "Failed to add history", error: err.message });
    }
});

// GET all histories
router.get('/all-histories', async (req, res) => {
    try {
        const histories = await History.find();
        res.status(200).json(histories);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch histories", error: err.message });
    }
});

// GET a history by ID
router.get('/history/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const history = await History.findById(id);
        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch history", error: err.message });
    }
});

// PUT update a history by ID
router.put('/update-history/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedHistory = await History.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedHistory) {
            return res.status(404).json({ message: "History not found" });
        }
        res.status(200).json(updatedHistory);
    } catch (err) {
        res.status(400).json({ message: "Failed to update history", error: err.message });
    }
});

// DELETE a history by ID
router.delete('/delete-history/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedHistory = await History.findByIdAndDelete(id);
        if (!deletedHistory) {
            return res.status(404).json({ message: "History not found" });
        }

        // Remove the history ID from the patient's history array
        await User.updateMany(
            { history: id },
            { $pull: { history: id } }
        );

        res.status(200).json({ message: "History deleted successfully", history: deletedHistory });
    } catch (err) {
        res.status(400).json({ message: "Failed to delete history", error: err.message });
    }
});

module.exports = router;
