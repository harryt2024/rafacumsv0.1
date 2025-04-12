// hashPassword.mjs
// Make sure bcrypt is installed: npm install bcrypt
import bcrypt from 'bcrypt';

// --- REPLACE WITH YOUR CHOSEN PASSWORD ---
const plainPassword = 'Alpha3302!';
// -----------------------------------------

const saltRounds = 10; // Same salt rounds as used in your user creation API potentially

console.log(`Hashing password: "${plainPassword}"`);

bcrypt.hash(plainPassword, saltRounds)
  .then(hash => {
    console.log('---- HASH GENERATED ----');
    console.log(`Copy this hash value:\n${hash}`);
    console.log('------------------------');
  })
  .catch(err => console.error('Error hashing password:', err));