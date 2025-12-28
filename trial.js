const bcrypt = require('bcrypt');

const hash = '$2b$10$GOhyURhFRcfuFK1quvkR2u6cmzea7aoNMiUaG8XpHKSFXkBPEDIQu';

// Try different passwords
const passwordsToTry = [
  'admin',
  'password',
  'admin123',
  '123456',
  'Admin@123'
];

passwordsToTry.forEach(async (pwd) => {
  const match = await bcrypt.compare(pwd, hash);
  console.log(`"${pwd}": ${match ? '✅ MATCH' : '❌ no match'}`);
});