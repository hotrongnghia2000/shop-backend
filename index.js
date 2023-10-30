const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// with sync middleware, express automatically catches errors
// with async middleware, must use next(err)
// if err cannot be handled by express, the server will crash => exception, ex: db err
// express-async-error will automatically catch the exception and call next to move to the next middleware
// then just need to create more middleware to catch the exception and notify the appropriate err
// when encountering an error with the database, the code will stop at the error location => next(err)
require('express-async-errors');

// connect DB
const connectDB = require('./src/configs/connectDB');

// create middleware via express.Router()
const initRouters = require('./src/routers');

const handleError = require('./src/middlewares/handleError');

const app = express();

// GENERAL MIDDLEWARE

// CORS
// SOP ==> browser requires data of a domain to be read and edited only by itself
// Do đó => http://localhost:8888 của vite không thể gọi api đến server http://localhost:8888
// cors is middleware that activates cors for every request sent
// customizable
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET'],
    credentials: true,
  })
);

app.use(cookieParser());

// request the server to accept json
app.use(express.json());
// request the server to accept data from html form such as string, array
app.use(express.urlencoded({ extended: true }));

// ROUTER
initRouters(app);

// HANDLE ERROR
app.use(handleError);

// CONNECT DB
connectDB();

app.listen(process.env.SERVER_PORT, () => {
  console.log('Server running...');
});
