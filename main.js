var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var fs = require('fs');
const generateUniquePass = require('./generateUniquePass');
//const generateUniqueCode = require('./generateUniqueCode');

var app = express();
app.use(cookieParser());
app.use(express.json()); // for parsing application/json

// Same middleware as before, checking for cookies
app.use(function (req, res, next) {
  // Rest of the middleware code
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './views/home.html'));
});

app.post('/generateToken', async function(req, res) {
  let uniquePass = await generateUniquePass.generateUniquePass(3, 10);
  res.cookie('pass', uniquePass, { maxAge: 10000, httpOnly: true }); // Set your options here
  res.sendFile(path.join(__dirname, './views/generateToken.html'));
});

// Rest of the server code
