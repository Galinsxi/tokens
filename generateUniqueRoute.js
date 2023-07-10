// Import required modules
const crypto = require('crypto');
const database = require('./database'); // Assuming you have a separate module for database operations

// Function to generate a random code
function generateRandomRoute(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

// Function to check if the code already exists in the database
async function codeExists(code) {
  // Assuming you have a function in the 'database' module that checks if the code exists
  const result = await database.checkPassExists(code);
  return result;
}

// Function to generate a unique code and insert it into the database
async function generateUniqueRoute(amount, length, pass) {
  
  for (let i = 0; i < amount; i++) {
    let code = generateRandomRoute(length);
    while (await codeExists(code)) {
      code = generateRandomRoute(length);
    }
  
    // Insert the generated code into the database
    await database.insertRoute(code, pass);
  }
  
  return amount;
}



module.exports = {
  generateUniqueRoute
};
