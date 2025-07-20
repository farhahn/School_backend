const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subName: {
        type: String,
        required: true,
    },
    subCode: {
        type: String,
        required: true,
        unique: true, // Add unique index
    },
    sessions: {
        type: String,
        required: true,
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
}, { timestamps: true });

// Ensure unique index on subCode
subjectSchema.index({ subCode: 1, school: 1 }, { unique: true }); // Unique per school

module.exports = mongoose.model("subject", subjectSchema);