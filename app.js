const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const path = require("path");
const Database = require("./config/database");

/* Initialize express application */
const app = express();
app.use(express.json());

/* Connect to the database */
const connectionString = require("./config/connection");
new Database(connectionString).connect();

module.exports = app;
