const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function checkHealth() {
  console.log('🚀 Starting System Health Check...\n');

  // 1. Environment Variables Check
  console.log('1️⃣  Checking Environment Variables...');
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'FASHN_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing Environment Variables:', missingVars.join(', '));
    console.warn('   (Note: This might be expected in a local/test environment if using .env.local)');
  } else {
    console.log('✅ All key environment variables are present.');
  }

  // 2. Database Connection Check
  console.log('\n2️⃣  Checking Database Connection...');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful.');
    
    // Check if VirtualModel exists in DB (schema sync check)
    // We try to count, if it fails, the table might be missing
    try {
      const count = await prisma.virtualModel.count();
      console.log(`✅ VirtualModel table accessed. Count: ${count}`);
    } catch (e) {
      console.error('❌ Failed to access VirtualModel table. Did you run "npx prisma db push" or "migrate"?');
      console.error('   Error:', e.message.split('\n')[0]);
    }

  } catch (e) {
    console.error('❌ Database connection failed.');
    console.error('   Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }

  // 3. API Structure Check
  console.log('\n3️⃣  Checking API Structure...');
  const apiDir = path.join(process.cwd(), 'src/app/api');
  if (fs.existsSync(apiDir)) {
    console.log('✅ API directory found.');
  } else {
    console.error('❌ API directory missing!');
  }

  console.log('\n🏁 Health Check Complete.');
}

checkHealth();
