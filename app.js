const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const path = require("path");
const Database = require("./config/database");
const router = require("./api/v1/routes/payment");

/* Initialize express application */
const app = express();
app.use(express.json());

/* Connect to the database */
const connectionString = require("./config/connection");
new Database(connectionString).connect();

// set the view engine to ejs
app.set("view engine", "ejs");

app.get("/home", (req, res) => {
  res.render("pages/index");
});

/* Bind app port to index router */
app.use("/", router);

module.exports = app;
