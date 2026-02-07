const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('✅ Connected to Database!');
        console.log('------------------------------------------------');
        console.log('Current Users in DB:', users.length);
        console.log(JSON.stringify(users, null, 2));
        console.log('------------------------------------------------');
    } catch (e) {
        console.error('❌ Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
