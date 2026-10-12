// DT-610: Integrate supabase database with backend
//  Locations CRUD API
const prisma = require('../config/db');

const REQUIRED_FIELDS = ['name', 'streetAddress', 'city', 'state', 'zipCode'];

function validateLocation(data) {
    for (const field of REQUIRED_FIELDS) {
        if (typeof data[field] !== 'string' || !data[field].trim()) {
            return `${field} is required.`;
        }
    }
    return null;
}

// GET /api/locations
async function getLocations(req, res, next) {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { name: 'asc' },
        });

        return res.status(200).json({ success: true, locations });
    } catch (err) {
        return next(err);
    }
}

// POST /api/locations
async function createLocation(req, res, next) {
    try {
        const data = req.body || {};
        const error = validateLocation(data);

        if (error) {
            return res.status(400).json({ success: false, error });
        }

        const location = await prisma.location.create({
            data: Object.fromEntries(
                REQUIRED_FIELDS.map((field) => [field, data[field].trim()])
            ),
        });

        return res.status(201).json({ success: true, location });
    } catch (err) {
        return next(err);
    }
}

// PUT /api/locations/:id
async function updateLocation(req, res, next) {
    try {
        const data = req.body || {};
        const error = validateLocation(data);

        if (error) {
            return res.status(400).json({ success: false, error });
        }

        const location = await prisma.location.update({
            where: { id: req.params.id },
            data: Object.fromEntries(
                REQUIRED_FIELDS.map((field) => [field, data[field].trim()])
            ),
        });

        return res.status(200).json({ success: true, location });
    } catch (err) {
        return next(err);
    }
}

// DELETE /api/locations/:id
async function deleteLocation(req, res, next) {
    try {
        await prisma.location.delete({
            where: { id: req.params.id },
        });

        return res.status(200).json({
            success: true,
            message: 'Location deleted successfully.',
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
};