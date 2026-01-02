const bcrypt = require('bcrypt');

const hash = '$2b$10$ZBLubPvvifRv8WbHeIYxZ.6JGCBatplUfavBEkFKgtEbRKNkhJ7v6';

// Try different passwords
const passwordsToTry = [
  'mera@123PASS',
  'password',
  'admin123',
  '123456',
  'Admin@123'
];

passwordsToTry.forEach(async (pwd) => {
  const match = await bcrypt.compare(pwd, hash);
  console.log(`"${pwd}": ${match ? '✅ MATCH' : '❌ no match'}`);
});

// node -e "console.log(require('bcrypt').hashSync('your_password_here', 10))"
// To generate a new hash, replace 'your_password_here' with the desired password.