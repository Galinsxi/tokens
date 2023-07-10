// Import required modules
const route = require('./generateUniqueRoute')
const crypto = require('crypto');
const database = require('./database'); // Assuming you have a separate module for database operations

// Function to generate a random code
function generateRandomPass(length) {
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
async function generateUniquePass(amount_of_routes,length) {
  console.log('Generating Pass')

  let code = generateRandomPass(length);
  while (await codeExists(code)) {
    code = generateRandomPass(length);
  }
  // Insert the generated code into the database
  await database.insertPass(code);
  
  // Generate the routes allowed from pass

  route.generateUniqueRoute(amount_of_routes, length, code); // Call the function using the 'route' object

  return code;
}


module.exports = {
  generateUniquePass
};