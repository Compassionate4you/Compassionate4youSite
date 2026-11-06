// DT-846: Customer Portal profile settings.
// Lets a signed-in user load and save their own profile.
const prisma = require('../config/db');
const { sendValidationError } = require('../utils/errorResponse');

// Fields sent back to the portal. Never includes the password or reset token.
const PROFILE_FIELDS = {
    email: true,
    name: true,
    phone: true,
    address: true,
    city: true,
    state: true,
    zip: true,
    emergencyName: true,
    emergencyPhone: true,
    emailNotif: true,
    smsNotif: true,
    preferredContact: true,
};

// Must match the options in the Preferred Contact Method dropdown on the portal
const CONTACT_METHODS = ['email', 'phone', 'sms'];

// Same phone check as sign-up
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

// Turns an optional text box into trimmed text, or null when it's left empty
function optionalText(value) {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

// DT-846: GET /api/portal/profile
// Loads the signed-in user's profile for the Profile Settings window
async function getProfile(req, res, next) {
    try {
        const profile = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: PROFILE_FIELDS,
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: { message: 'Account not found.', field: null },
            });
        }

        return res.status(200).json({ success: true, profile });
    } catch (err) {
        return next(err);
    }
}

// DT-846: PUT /api/portal/profile
// Saves the signed-in user's profile. Users can only change their own,
// since the id comes from their login, not from the request.
async function updateProfile(req, res, next) {
    try {
        const {
            name,
            phone,
            address,
            city,
            state,
            zip,
            emergencyName,
            emergencyPhone,
            emailNotif,
            smsNotif,
            preferredContact,
        } = req.body || {};

        // Required fields (marked with * on the form)
        if (typeof name !== 'string' || !name.trim()) {
            return sendValidationError(res, 'Please enter your full name.', 'name');
        }
        if (typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
            return sendValidationError(res, 'Please enter a valid phone number.', 'phone');
        }
        if (typeof zip !== 'string' || !zip.trim()) {
            return sendValidationError(res, 'Please enter your ZIP code.', 'zip');
        }

        // Emergency phone is optional, but has to be a real number if filled in
        const emergencyPhoneValue = optionalText(emergencyPhone);
        if (emergencyPhoneValue && !PHONE_RE.test(emergencyPhoneValue)) {
            return sendValidationError(res, 'Please enter a valid emergency contact phone.', 'emergencyPhone');
        }

        if (!CONTACT_METHODS.includes(preferredContact)) {
            return sendValidationError(res, 'Please choose a preferred contact method.', 'preferredContact');
        }

        const profile = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name.trim(),
                phone: phone.trim(),
                address: optionalText(address),
                city: optionalText(city),
                state: optionalText(state),
                zip: zip.trim(),
                emergencyName: optionalText(emergencyName),
                emergencyPhone: emergencyPhoneValue,
                emailNotif: emailNotif === true,
                smsNotif: smsNotif === true,
                preferredContact,
            },
            select: PROFILE_FIELDS,
        });

        // Send back the saved profile so the portal shows exactly what was stored
        return res.status(200).json({ success: true, profile });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getProfile, updateProfile };