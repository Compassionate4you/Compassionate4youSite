// Prisma client. Connects through the Supabase transaction pooler,
// so queries go over DATABASE_URL (port 6543).
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy server/.env.example to server/.env.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function disconnect() {
    await prisma.$disconnect();
}

module.exports = { prisma, disconnect };
