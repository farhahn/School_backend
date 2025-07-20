const mongoose = require('mongoose');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.ts');

const subjectCreate = async (req, res) => {
    try {
        const { subjects, sclassName, adminID } = req.body;
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ message: 'Subjects array is required and cannot be empty' });
        }
        if (!mongoose.isValidObjectId(sclassName)) {
            return res.status(400).json({ message: 'Invalid sclassName' });
        }
        if (!mongoose.isValidObjectId(adminID)) {
            return res.status(400).json({ message: 'Invalid adminID' });
        }

        // Validate each subject
        for (const subject of subjects) {
            if (!subject.subName || typeof subject.subName !== 'string' || subject.subName.trim() === '') {
                return res.status(400).json({ message: 'Subject name is required and must be a non-empty string' });
            }
            if (!subject.subCode || typeof subject.subCode !== 'string' || subject.subCode.trim() === '') {
                return res.status(400).json({ message: 'Subject code is required and must be a non-empty string' });
            }
            if (!subject.sessions || typeof subject.sessions !== 'string' || subject.sessions.trim() === '') {
                return res.status(400).json({ message: 'Sessions is required and must be a non-empty string' });
            }
        }

        // Verify sclassName exists
        const Sclass = mongoose.model('sclass');
        const classExists = await Sclass.findById(sclassName);
        if (!classExists) {
            return res.status(400).json({ message: 'Class with provided sclassName does not exist' });
        }

        // Verify adminID exists
        const Admin = mongoose.model('admin');
        const adminExists = await Admin.findById(adminID);
        if (!adminExists) {
            return res.status(400).json({ message: 'Admin with provided adminID does not exist' });
        }

        // Create new subjects
        const newSubjects = subjects.map((subject) => ({
            subName: subject.subName.trim(),
            subCode: subject.subCode.trim(),
            sessions: subject.sessions.trim(),
            sclassName,
            school: adminID,
        }));

        const result = await Subject.insertMany(newSubjects);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error in subjectCreate:', err);
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate subject code detected',
                error: err.message,
            });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

// Other endpoints remain unchanged
const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const classSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (subject) {
            subject = await subject.populate("sclassName", "sclassName");
            subject = await subject.populate("teacher", "name");
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(400).json({ message: 'Subject not found' });
        }

        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id }, attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects
};