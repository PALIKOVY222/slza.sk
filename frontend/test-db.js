const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔄 Testujem pripojenie k databáze...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Pripojenie funguje!');
    console.log('Databáza:', result);
    
    const users = await prisma.user.findMany();
    console.log('\n📋 Používatelia v databáze:', users.length);
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    
  } catch (error) {
    console.error('❌ Chyba pripojenia:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
