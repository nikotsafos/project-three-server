require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressJWT = require('express-jwt');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const moment = require('moment');

// App instance
const app = express();


// Set up middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));

// Helper function: this allows our server to parse the incoming token from the client
// This is being run as middleware so it has access to the incoming request
function fromRequest(req){
  if(req.body.headers.Authorization &&
    req.body.headers.Authorization.split(' ')[0] === 'Bearer'){
    return req.body.headers.Authorization.split(' ')[1];
  }
  return null;
}

// Controllers
// All auth routes are protected except for POST to /auth/login and POST /auth/signup
// Remember to pass the JWT_SECRET (it will break without it)
// NOTE: The unless portion is only needed if you need exceptions
app.use('/auth', expressJWT({
  secret: process.env.JWT_SECRET,
  getToken: fromRequest
}).unless({
  path: [
    { url: '/auth/login', methods: ['POST'] },
    { url: '/auth/signup', methods: ['POST'] }
  ]
}), require('./controllers/auth'));

// app.use('/users', require('./controllers/users'));

app.use('/spending', expressJWT({
  secret: process.env.JWT_SECRET,
  getToken: fromRequest
}), require('./controllers/spending'));

app.use('/money', expressJWT({
  secret: process.env.JWT_SECRET,
  getToken: fromRequest
}), require('./controllers/money'));

app.use('/budget', expressJWT({
  secret: process.env.JWT_SECRET,
  getToken: fromRequest
}), require('./controllers/budget'));

// app.use('/profile', require('./controllers/profile'));



// This is the catch all route. ideally you dont get here unless you made a mistake on your frontend
app.get('*', function(req, res, next) {
	res.send({ message: 'Not Found', error: 404 });
});

// Listen to specified PORT or default to 3000
app.listen(process.env.PORT || 3000);
