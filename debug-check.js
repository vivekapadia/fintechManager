const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Read .env manually
try {
    const envPath = path.resolve(__dirname, 'packages', 'database', '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if (key && value && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
    console.log('Loaded env manually');
} catch (e) {
    console.log('Could not load .env', e.message);
}

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB with URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');
        // Simple check first
        const count = await prisma.asset.count();
        console.log('Total assets:', count);

        // Then fetch with include
        console.log('Fetching with relations...');
        const assets = await prisma.asset.findMany({
            include: {
                investmentDetails: true,
                fdDetails: true,
                loanDetails: true
            }
        });
        console.log('Success! Found ' + assets.length + ' assets.');
        assets.forEach(a => console.log(`- Asset: ${a.name} (${a.type}), UserID: ${a.userId}`));
        // Check if any asset has fdDetails
        const hasFD = assets.some(a => a.fdDetails);
        console.log('Has FD Details:', hasFD);

    } catch (e) {
        console.error('Error fetching assets:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
