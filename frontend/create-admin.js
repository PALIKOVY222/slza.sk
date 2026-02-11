const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'kovac.jr@slza.sk',
        passwordHash: passwordHash,
        firstName: 'Pavel',
        lastName: 'Kováč',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', user.email);
    console.log('Password: admin123');
    console.log('\nTeraz môžeš:');
    console.log('1. Spustiť aplikáciu: npm run dev');
    console.log('2. Otvoriť: http://localhost:3000/login');
    console.log('3. Prihlásiť sa s emailom a heslom');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin už existuje!');
      console.log('Email: kovac.jr@slza.sk');
      console.log('Heslo: admin123');
    } else {
      console.error('❌ Chyba:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
