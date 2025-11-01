const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    inquiry: { type: String, required: true },
    comments: [
        {
            practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner', required: true }, // Reference to Practitioner
            text: { type: String, required: true }, // Comment text
            createdAt: { type: Date, default: Date.now } // Timestamp for the comment
        }
    ]
}, {
    timestamps: true
});

const Inquiry = mongoose.model('Inquiry', InquirySchema);

module.exports = Inquiry