const generateUniquePass = require('./generateUniquePass');
const database = require('./database');
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

// List of allowed routes
const allowedRoutes = ['/home', '/token', '/generatetoken', '/route', '/target', '/deletecookie', '/burntoken', '/burn'];

// Middleware to restrict access to specified routes
app.use((req, res, next) => {
  if (allowedRoutes.includes(req.path)) {
    next();
  } else {
    res.redirect('/home');
  }
});

app.get('/home', (req, res) => {
  const hasCookie = req.cookies && req.cookies.token;

  if (hasCookie) {
    res.redirect('/generatetoken');
  } else {
    res.sendFile(path.join(viewsPath, 'home.html'));
  }
});

app.get('/token', (req, res) => {
  const token = req.cookies && req.cookies.token;

  fs.readFile(path.join(viewsPath, 'token.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.send('Error reading file!');
      return;
    }

    const result = data.replace(/%message%/g, token || 'No token found');

    res.send(result);
  });
});

app.get('/generatetoken', async (req, res) => {
  const hasCookie = req.cookies && req.cookies.token;

  if (hasCookie) {
    res.sendFile(path.join(viewsPath, 'generateToken.html'));
  } else {
    try {
      const uniquePass = await generateUniquePass.generateUniquePass(3, 10);
      res.cookie('token', uniquePass, { maxAge: 3600000 });
      console.log('Cookie:', uniquePass);
      res.sendFile(path.join(viewsPath, 'generatetoken.html'));
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
      res.cookie('route', nextRoute, { maxAge: 3600000 });
      res.redirect('/target');
    } catch (error) {
      console.error('Either token is active now or Error generating new route:', error);
      let token = req.cookies && req.cookies.token;
      database.activateRoutePass(token);
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
      console.log(route);
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
  res.sendFile(path.join(viewsPath, 'revoketoken.html'));
});

app.post('/burn', async (req, res) => {
  const token = req.body.token;

  if (token) {
    try {
      const status = await database.checkStatus(token);
      if (status == true) {
        await database.burnToken(token);
        res.sendFile(path.join(viewsPath, 'tokenrevoked.html'));
      } else {
        res.sendFile(path.join(viewsPath, 'tokennotvalid.html'));
      }
    } catch (error) {
      console.error('Error burning token:', error);
      res.send('Error burning token!');
    }
  } else {
    res.send('Token is required!');
  }
});

console.log(__dirname);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
