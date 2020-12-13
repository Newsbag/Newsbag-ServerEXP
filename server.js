require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 8080;

require('./app_api/models/db');
require('./app_api/config/passport');

const apiRouter = require(path.join(__dirname, 'app_api', 'routes', 'index'));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "uploads")));

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});