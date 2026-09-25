const MeasurementProfile = require('../models/MeasurementProfile');

// @route   GET /api/measurements
exports.getProfiles = async (req, res, next) => {
    try {
        const profiles = await MeasurementProfile.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json({ success: true, profiles });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/measurements
exports.createProfile = async (req, res, next) => {
    try {
        const { profileName, garmentType, measurements } = req.body;

        const profile = await MeasurementProfile.create({
            userId: req.user._id,
            profileName,
            garmentType: garmentType || 'general',
            measurements,
        });

        res.status(201).json({ success: true, profile });
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/measurements/:id
exports.updateProfile = async (req, res, next) => {
    try {
        const profile = await MeasurementProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        if (profile.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { profileName, garmentType, measurements } = req.body;
        if (profileName) profile.profileName = profileName;
        if (garmentType) profile.garmentType = garmentType;
        if (measurements) profile.measurements = measurements;

        await profile.save();
        res.json({ success: true, profile });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/measurements/:id
exports.deleteProfile = async (req, res, next) => {
    try {
        const profile = await MeasurementProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        if (profile.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await MeasurementProfile.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Profile deleted' });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/measurements/templates/:garmentType
exports.getTemplate = async (req, res, next) => {
    try {
        const templates = {
            shirt: {
                fields: [
                    { name: 'chest', label: 'Chest', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your chest' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder edge to the other' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to wrist' },
                    { name: 'neck', label: 'Neck', unit: 'inches', required: true, helpText: 'Measure around the base of your neck' },
                    { name: 'shirt_length', label: 'Shirt Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired length' },
                    { name: 'bicep', label: 'Bicep', unit: 'inches', required: false, helpText: 'Measure around the fullest part of your upper arm' },
                ],
            },
            trousers: {
                fields: [
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hip', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your hips' },
                    { name: 'inseam', label: 'Inseam', unit: 'inches', required: true, helpText: 'Measure from crotch to ankle' },
                    { name: 'outseam', label: 'Outseam', unit: 'inches', required: true, helpText: 'Measure from waist to ankle along the outer leg' },
                    { name: 'thigh', label: 'Thigh', unit: 'inches', required: false, helpText: 'Measure around the fullest part of your thigh' },
                    { name: 'knee', label: 'Knee', unit: 'inches', required: false, helpText: 'Measure around your knee' },
                    { name: 'bottom_width', label: 'Bottom Width', unit: 'inches', required: false, helpText: 'Desired trouser opening width' },
                ],
            },
            kurta: {
                fields: [
                    { name: 'chest', label: 'Chest', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your chest' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hip', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your hips' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder edge to the other' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to wrist' },
                    { name: 'kurta_length', label: 'Kurta Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired length' },
                    { name: 'neck', label: 'Neck', unit: 'inches', required: false, helpText: 'Measure around the base of your neck' },
                ],
            },
            blouse: {
                fields: [
                    { name: 'bust', label: 'Bust', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your bust' },
                    { name: 'under_bust', label: 'Under Bust', unit: 'inches', required: true, helpText: 'Measure just below your bust' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder to the other' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired length' },
                    { name: 'blouse_length', label: 'Blouse Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired length' },
                    { name: 'armhole', label: 'Armhole', unit: 'inches', required: false, helpText: 'Measure around the armhole opening' },
                    { name: 'back_neck_depth', label: 'Back Neck Depth', unit: 'inches', required: false, helpText: 'Desired depth of the back neckline' },
                    { name: 'front_neck_depth', label: 'Front Neck Depth', unit: 'inches', required: false, helpText: 'Desired depth of the front neckline' },
                ],
            },
            lehenga: {
                fields: [
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hip', unit: 'inches', required: true, helpText: 'Measure around the fullest part' },
                    { name: 'lehenga_length', label: 'Lehenga Length', unit: 'inches', required: true, helpText: 'Measure from waist to floor' },
                    { name: 'flare', label: 'Flare/Ghera', unit: 'meters', required: false, helpText: 'Desired flare circumference' },
                ],
            },
            dress: {
                fields: [
                    { name: 'bust', label: 'Bust', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your bust' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hips', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your hips' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder to the other' },
                    { name: 'dress_length', label: 'Dress Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired bottom length' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: false, helpText: 'Measure from shoulder to wrist (if applicable)' },
                ],
            },
            suit: {
                fields: [
                    { name: 'chest', label: 'Chest', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your chest' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder edge to the other' },
                    { name: 'jacket_length', label: 'Jacket/Suit Length', unit: 'inches', required: true, helpText: 'Measure from neck base to desired length' },
                    { name: 'trouser_waist', label: 'Trouser Waist', unit: 'inches', required: true, helpText: 'Measure where you normally wear your trousers' },
                    { name: 'inseam', label: 'Trouser Inseam', unit: 'inches', required: true, helpText: 'Measure from crotch to ankle' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to wrist' },
                ],
            },
            sherwani: {
                fields: [
                    { name: 'chest', label: 'Chest', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your chest' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder edge to the other' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to wrist' },
                    { name: 'sherwani_length', label: 'Sherwani Length', unit: 'inches', required: true, helpText: 'Measure from neck to desired base length' },
                    { name: 'pajama_length', label: 'Pajama / Trouser Length', unit: 'inches', required: true, helpText: 'Measure from waist to ankle' },
                ],
            },
            kurti: {
                fields: [
                    { name: 'bust', label: 'Bust', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your bust' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hips', unit: 'inches', required: true, helpText: 'Measure around the fullest part of your hips' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from one shoulder edge to the other' },
                    { name: 'kurti_length', label: 'Kurti Length', unit: 'inches', required: true, helpText: 'Measure from shoulder to desired length' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: false, helpText: 'Measure from shoulder to desired sleeve end' },
                ],
            },
            general: {
                fields: [
                    { name: 'chest_bust', label: 'Chest / Bust', unit: 'inches', required: true, helpText: 'Measure around the fullest part of chest or bust' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Measure around your natural waistline' },
                    { name: 'hip', label: 'Hips', unit: 'inches', required: false, helpText: 'Measure around the fullest part of your hips' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Measure from shoulder tip to shoulder tip' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: false, helpText: 'Measure from shoulder edge to wrist or elbow' },
                    { name: 'total_length', label: 'Garment Length', unit: 'inches', required: true, helpText: 'Top to bottom length' },
                ],
            },
            salwar_suit: {
                fields: [
                    { name: 'bust', label: 'Kameez Bust', unit: 'inches', required: true, helpText: 'Fullest part of bust' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Natural waistline' },
                    { name: 'kameez_length', label: 'Kameez Length', unit: 'inches', required: true, helpText: 'Shoulder to bottom of kameez' },
                    { name: 'salwar_waist', label: 'Salwar / Bottom Waist', unit: 'inches', required: true, helpText: 'Where you wear your bottom' },
                    { name: 'salwar_length', label: 'Salwar Length', unit: 'inches', required: true, helpText: 'Waist to ankle' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: false, helpText: 'Shoulder to sleeve end' },
                ],
            },
            anarkali: {
                fields: [
                    { name: 'bust', label: 'Bust', unit: 'inches', required: true, helpText: 'Fullest part of bust' },
                    { name: 'under_bust', label: 'Under Bust', unit: 'inches', required: true, helpText: 'Just below bust line' },
                    { name: 'waist', label: 'Waist', unit: 'inches', required: true, helpText: 'Natural waistline' },
                    { name: 'anarkali_length', label: 'Anarkali Length', unit: 'inches', required: true, helpText: 'Shoulder to floor or ankle' },
                    { name: 'shoulder', label: 'Shoulder Width', unit: 'inches', required: true, helpText: 'Shoulder edge to edge' },
                    { name: 'sleeve_length', label: 'Sleeve Length', unit: 'inches', required: false, helpText: 'Shoulder to wrist' },
                ],
            },
            half_saree: {
                fields: [
                    { name: 'bust', label: 'Blouse Bust', unit: 'inches', required: true, helpText: 'Fullest part of bust' },
                    { name: 'blouse_length', label: 'Blouse Length', unit: 'inches', required: true, helpText: 'Shoulder to bottom of blouse' },
                    { name: 'skirt_waist', label: 'Skirt Waist', unit: 'inches', required: true, helpText: 'Waist where skirt is tied' },
                    { name: 'skirt_length', label: 'Skirt Length', unit: 'inches', required: true, helpText: 'Waist to floor' },
                ],
            },
            kids_kurta: {
                fields: [
                    { name: 'chest', label: 'Chest', unit: 'inches', required: true, helpText: 'Chest circumference' },
                    { name: 'shoulder', label: 'Shoulder', unit: 'inches', required: true, helpText: 'Shoulder to shoulder' },
                    { name: 'kurta_length', label: 'Kurta Length', unit: 'inches', required: true, helpText: 'Shoulder to knee' },
                    { name: 'pyjama_length', label: 'Pyjama Length', unit: 'inches', required: true, helpText: 'Waist to ankle' },
                ],
            },
        };

        const template = templates[req.params.garmentType] || templates.general;
        res.json({ success: true, garmentType: req.params.garmentType, template });
    } catch (error) {
        next(error);
    }
};
