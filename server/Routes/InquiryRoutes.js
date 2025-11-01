const express = require('express');
const Inquiry = require('../Models/Inquiry.js');
const User = require('../Models/User.js'); // Unified User model

const router = express.Router();

// GET all inquiries (sorted descending)
router.get('/all-inquiries', async (req, res) => {
    try {
        // Fetch all inquiries
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });

        // Fetch user details for each inquiry
        const inquiriesWithUserNames = await Promise.all(
            inquiries.map(async (inquiry) => {
                const user = await User.findById(inquiry.userId).select('name'); // Fetch user's name only
                return {
                    ...inquiry.toObject(),
                    name: user ? user.name : 'Unknown User', // Attach user name, handle cases where user is not found
                };
            })
        );

        res.status(200).json(inquiriesWithUserNames);
    } catch (err) {
        res.status(400).json({ message: "Failed to fetch inquiries", error: err.message });
    }
});


// GET inquiry by user id ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const inquiry = await Inquiry.findById(id).lean(); // Use lean() for better performance
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        const user = await User.findById(inquiry.userId);

        // Populate practitioner's name in comments
        const commentsWithNames = await Promise.all(
            inquiry.comments.map(async (comment) => {
                const practitioner = await User.findById(comment.practitionerId);
                return {
                    ...comment,
                    practitionerName: practitioner?.name || "Unknown Practitioner",
                };
            })
        );

        const result = {
            name: user.name,
            inquiry: {
                ...inquiry,
                comments: commentsWithNames,
            },
        };

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: "Failed to fetch inquiry", error: err.message });
    }
});


// POST create a new inquiry
router.post('/add-inquiry', async (req, res) => {
    const { userId, inquiry, comments } = req.body;

    try {
        // Validate the user as a patient
        const user = await User.findById(userId);
        if (!user || user.role !== 'Patient') {
            return res.status(401).json({ message: "User is not a patient - not allowed to inquire" });
        }

        // Create the inquiry
        const newInquiry = new Inquiry({
            userId,
            inquiry,
            comments: comments || [],
        });
        const savedInquiry = await newInquiry.save();
        res.status(201).json(savedInquiry);
    } catch (err) {
        res.status(400).json({ message: "Failed to create inquiry", error: err.message });
    }
});

// PUT update an inquiry by ID
router.put('/update-inquiry/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedInquiry = await Inquiry.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json(updatedInquiry);
    } catch (err) {
        res.status(400).json({ message: "Failed to update inquiry", error: err.message });
    }
});

// DELETE an inquiry by ID
router.delete('/delete-inquiry/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedInquiry = await Inquiry.findByIdAndDelete(id);
        if (!deletedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        res.status(200).json({ message: "Inquiry deleted successfully", inquiry: deletedInquiry });
    } catch (err) {
        res.status(400).json({ message: "Failed to delete inquiry", error: err.message });
    }
});

// POST add a comment to an inquiry
router.post('/add-comment/:id', async (req, res) => {
    const { id } = req.params;
    const { practitionerId, text } = req.body;

    try {
        // Validate the inquiry exists
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        // Validate the practitionerId corresponds to a Practitioner
        const user = await User.findById(practitionerId);
        if (!user || user.role !== 'Practitioner') {
            return res.status(401).json({ message: "User is not a practitioner - not allowed to comment" });
        }

        // Add the comment
        inquiry.comments.push({ practitionerId, text, createdAt: new Date() });
        const updatedInquiry = await inquiry.save();

        res.status(200).json(updatedInquiry);
    } catch (err) {
        res.status(400).json({ message: "Failed to add comment", error: err.message });
    }
});

module.exports = router;
