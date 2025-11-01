const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ['Practitioner', 'Patient'], required: true },
    name: { type: String, required: true },
    age: { type: Number, required: function () { return this.role === 'Patient'; } }, // Required for patients
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: function () { return this.role === 'Patient'; } }, // For patients
    contact: { type: String, required: true }, // Shared
    birth: { type: Date, required: function () { return this.role === 'Patient'; } }, // Required for patients

    // Practitioner-specific fields
    profession: { type: String, required: function () { return this.role === 'Practitioner'; } },
    yearsExperience: { type: Number, required: function () { return this.role === 'Practitioner'; } },
    location: { type: String, required: function () { return this.role === 'Practitioner'; } },
    availableDays: { type: [Date], required: false },

    // Patient-specific fields
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'History', default: null }],
    inquiries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' }],

    // Ratings (for Practitioners)
    ratings: [
        {
            patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Patient user
            value: { type: Number, min: 0, max: 5 },
        },
    ],
}, {
    timestamps: true, // Add createdAt and updatedAt
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
