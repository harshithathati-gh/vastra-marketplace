const ContactMessage = require('../models/ContactMessage');

exports.submitContactMessage = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        const msg = await ContactMessage.create({ name, email, message });
        res.status(201).json({ success: true, message: msg });
    } catch (error) {
        next(error);
    }
};

exports.getContactMessages = async (req, res, next) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        next(error);
    }
};

exports.updateMessageStatus = async (req, res, next) => {
    try {
        const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json({ success: true, message: msg });
    } catch (error) {
        next(error);
    }
};
