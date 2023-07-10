const generateUniquePass = require('./generateUniquePass');
//const generateUniqueCode = require('./generateUniqueCode');
/*
generateUniquePass.generateUniquePass(3,10).then((result) => {
  console.log(result);
}).catch((error) => {
  console.error(error);
});
*/

const database = require('./database'); // Assuming you have a separate module for database operations


const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const viewsPath = path.join(__dirname, 'views');
const port = 3000;
const bodyParser = require('body-parser');


app.use(cookieParser());
app.use(express.static(viewsPath));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/home', (req, res) => {
  const hasCookie = req.cookies && req.cookies.token;

  if (hasCookie) {
    res.redirect('/generatetoken');
  } else {
    res.sendFile(path.join(viewsPath, 'home.html'));
  }
});

app.get('/token', (req, res) => {
  // Get the token from the cookies
  const token = req.cookies && req.cookies.token;

  // Read the file
  fs.readFile(path.join(viewsPath, 'token.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.send('Error reading file!');
      return;
    }

    // Replace %message% with the token
    const result = data.replace(/%message%/g, token || 'No token found');

    // Send the modified file
    res.send(result);
  });
});


app.get('/generatetoken', async (req, res) => {
  const hasCookie = req.cookies && req.cookies.token;

  if (hasCookie) {
    // Token already exists
      res.sendFile(path.join(viewsPath, 'generateToken.html'));
  } else {
    try {
      const uniquePass = await generateUniquePass.generateUniquePass(3, 10);
      res.cookie('token', uniquePass, { maxAge: 3600000 }); // Set the cookie with a maxAge of 1 hour (3600000 milliseconds)
      
      console.log('Cookie:', uniquePass); // Print the cookie information on the terminal
      
      res.sendFile(path.join(viewsPath, 'generateToken.html'));
    } catch (error) {
      res.send('Error generating token!');
    }
  }
});


app.get('/route', async (req, res) => {
  const token = req.cookies && req.cookies.token;

  if (token) {
    try {
      const nextRoute = await database.nextRoute(token);
      res.cookie('route', nextRoute, { maxAge: 3600000 }); // Sets a 'route' cookie with a maxAge of 1 hour
      res.redirect('/target'); // Redirect to "/target" after setting the cookie
    } catch (error) {
      console.error('Either token is active now or Error generating new route:', error);
      let token = req.cookies && req.cookies.token;
      database.activateRoutePass(token)
      res.redirect('/token');
    }
  } else {
    res.send('Token not found!');
  }
});



app.get('/target', async (req, res) => {
  const route = req.cookies && req.cookies.route;
  
  if (route) {
    try {
      console.log(route)
      await database.dropRow(route);
      res.redirect('/home');
    } catch (error) {
      console.error('Error dropping row:', error);
      res.send('Error dropping row!');
    }
  } else {
    res.send('Route cookie not found!');
  }
});




const fs = require('fs');

app.get('/deletecookie', (req, res) => {
  let message;
  
  if (req.cookies) {
    const cookies = Object.keys(req.cookies);
  
    if (cookies.length > 0) {
      cookies.forEach(cookie => {
        res.clearCookie(cookie);
      });
      message = 'Cookies deleted!';
    } else {
      message = 'No cookies found!';
    }
  } else {
    message = 'No cookies found!';
  }

  fs.readFile('./views/deletecookies.html', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
      return;
    }

    const result = data.replace('%message%', message);

    res.send(result);
  });
});

app.get('/burntoken', (req, res) => {
  res.send(`
    <form action="/burn" method="POST">
      <input type="text" name="token" placeholder="Enter Token">
      <button type="submit">Burn</button>
    </form>
  `);
});

app.post('/burn', async (req, res) => {
  const token = req.body.token;

  if (token) {
    try {
      const status = await database.checkStatus(token);
      if (status == true) {
        await database.burnToken(token);
        res.sendFile(path.join(viewsPath, 'generateToken.html'));
        //res.send('Token burned successfully!');
      } else {
        res.send('Token is not valid!');
      }
    } catch (error) {
      console.error('Error burning token:', error);
      res.send('Error burning token!');
    }
  } else {
    res.send('Token is required!');
  }
});





app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
