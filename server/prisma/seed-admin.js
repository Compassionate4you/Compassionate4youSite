const bcrypt = require('bcryptjs');

async function seedAdmin(prisma, env = process.env) {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log('Admin     skipped (set ADMIN_EMAIL and ADMIN_PASSWORD to create one)');
        return;
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
        where: { email },
        update: { role: 'admin' },
        create: { email, password, role: 'admin' },
    });
    console.log(`Admin     ${email} can now edit cards`);
}

module.exports = { seedAdmin };
