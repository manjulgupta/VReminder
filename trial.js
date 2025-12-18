const bcrypt = require('bcrypt');

bcrypt.compare(
  'admin123',
  '$2b$10$UIhfohoX8ZOH2Myxygqi.OmyQw9eQswZDrj1oPDWw0j5E8d0Yoyva'
).then(console.log);
