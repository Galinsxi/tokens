// database.js

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'luxa5',
  password: 'postgres',
  port: 5432 // Change the port if necessary
});

// Function to execute a query with the connection pool
function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err);
        return;
      }

      client.query(query, params, (error, results) => {
        done();

        if (error) {
          reject(error);
        } else {
          resolve(results.rows);
        }
      });
    });
  });
}

async function selectQuery(query) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query);
    return result.rows;
  } finally {
    if (client) {
      client.release();
    }
  }
}


// Function to check if a code exists in the route_pass table
async function checkCodeExists(code) {
  const query = 'SELECT COUNT(*) AS count FROM route_pass WHERE route_pass = $1';
  const results = await executeQuery(query, [code]);
  const count = results[0].count;
  return count > 0;
}

async function checkPassExists(code) {
  const query = 'SELECT COUNT(*) AS count FROM route_pass WHERE route_pass = $1';
  const results = await executeQuery(query, [code]);
  const count = results[0].count;
  return count > 0;
}

async function checkRouteExists(code) {
  const query = 'SELECT COUNT(*) AS count FROM route WHERE route = $1';
  const results = await executeQuery(query, [code]);
  const count = results[0].count;
  return count > 0;
}

// Function to insert a new code into the route_pass table
async function insertPass(pass) {
  const query = 'INSERT INTO route_pass (route_pass, active) VALUES ($1, false)';
  await executeQuery(query, [pass]);
}

// Function to insert a new token into the tokens table
async function insertToken(token) {
  const query = 'INSERT INTO tokens (token) VALUES ($1)';
  await executeQuery(query, [token]);
}

// Function to insert a new route into the routes table
async function insertRoute(route, pass) {
  try {
    // Retrieve the route_id from the route_pass table based on the pass parameter
    const passQuery = 'SELECT route_id FROM route_pass WHERE route_pass = \''+pass+'\'';
    const passResult = await selectQuery(passQuery, [pass]);
    const passId = passResult[0].route_id;

    // Insert the route into the routes table along with the retrieved pass_id
    const routeQuery = 'INSERT INTO routes (pass_id, route) VALUES ($1, $2)';
    await executeQuery(routeQuery, [passId, route]); 
  
  } catch (error) {
    console.error('Error inserting route:', error);
  }
}

async function burnToken(token) {
  try {
    // Assuming you have a function in the 'database' module to delete a token row based on the token value
    await database.deleteToken(token);
    console.log('Token burned successfully.');
  } catch (error) {
    console.error('Error burning token:', error);
  }
}

async function nextRoute(route_pass){
  const query = 'SELECT route FROM routes INNER JOIN route_pass ON routes.pass_id = route_pass.route_id WHERE route_pass.route_pass = \''+route_pass+'\' LIMIT 1;';
  console.log(query)
  const result = await selectQuery(query)
  return result[0].route
}

async function dropRow(route){
  const query = 'DELETE FROM routes WHERE route = \''+route+'\';';
  console.log(query)
  await selectQuery(query)
}

async function checkStatus(token) {
  const query = 'SELECT COUNT(*) AS count FROM route_pass WHERE route_pass = $1 AND active = true';
  const results = await executeQuery(query, [token]);
  const count = results[0].count;
  return count;
}

async function activateRoutePass(routePass) {
  const query = 'UPDATE route_pass SET active = true WHERE route_pass = \''+routePass+'\' ' ;
  await selectQuery(query);
}



async function burnToken(route){
  const query = 'DELETE FROM route_pass WHERE route_pass = \''+route+'\';';
  await selectQuery(query)
  console.log("Deleted: "+query)
}

module.exports = {
  activateRoutePass,
  checkStatus,
  dropRow,
  nextRoute,
  burnToken,
  checkCodeExists,
  checkPassExists,
  insertPass,
  insertRoute,
  insertToken
};
