# easy_pay-api

> A Node js API that provides a platform for users to transfer money to a designated vendor. It integrates Paystack's payment gateway as the payment service and uses EJS as the templating engine.

| PROJECT FEATURE             |       STATUS       |
| :-------------------------- | :----------------: |
| User Payment                | :white_check_mark: |
| Vendor Payment Verification | :white_check_mark: |
| User Receipt                | :white_check_mark: |

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/christian-bayata/easy-pay.git
```

then

```sh
# cd into project root
$ yarn
$ yarn start
```

## Folder Structure

This codebase has the following directories:

- api - for controllers and routes.
- config - Settings for mongoDB database and mongoose connection.
- models - Database schema definitions, plugins and model creation
- views - EJS pages to be rendered

## Components of the API

## api

## _Controllers_

The `payment` controller contains the codebase for initializing the payment, verifying the payment and issuing of the receipt after successful payment.

```js
const request = require("request");
const util = require("util");
const theRequest = util.promisify(request);
const User = require("../../../models/user");

const initializePayment = async (req, res) => {
  const { firstName, lastName, email, amount } = req.body;

  try {
    const url = `https://api.paystack.co/transaction/initialize`;
    const SECRET = process.env.PAYSTACK_TEST_SK;

    const options = {
      method: "POST",
      url: url,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${SECRET}`,
      },
      body: { firstName, lastName, email, amount: amount * 100, metadata: { firstName, lastName } },
      json: true,
    };

    /* Paystack payment initialization */
    theRequest(options).then(async (resp) => {
      if (resp.body.status == true) {
        return res.redirect(resp.body.data.authorization_url);
      }
      if (resp.body.status == false) {
        console.log("Resp: ", resp.body.message);
        return res.render("pages/error");
      }
    });
  } catch (error) {
    console.log(error);
    return res.render("pages/error");
  }
};

const verifyPayment = async (req, res) => {
  const { refId } = req.query;

  try {
    const url = `https://api.paystack.co/transaction/verify/${refId}`;
    const SECRET = process.env.PAYSTACK_TEST_SK;

    const options = {
      method: "GET",
      url: url,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${SECRET}`,
      },
      body: "{}",
    };

    theRequest(options).then(async (resp) => {
      const response = JSON.parse(resp.body);
      console.log("Response: ", response);
      if (response.data.status == "success") {
        const { reference, currency, paid_at, amount, metadata, customer } = response.data;
        /* Save user payment info */
        const theUser = await User.create({ reference, amount: +(amount / 100), firstName: metadata.firstName, lastName: metadata.lastName, email: customer.email, paidAt: paid_at, currency });
        if (!theUser) {
          res.redirect(400, "pages/error");
        }

        return res.redirect(301, `/receipt/${theUser._id}`);
      }
    });
  } catch (error) {
    console.log(error);
    return res.render("pages/error");
  }
};

const getReceipt = async (req, res) => {
  const { id } = req.params;

  try {
    const theUser = await User.findOne({ _id: id });
    if (!theUser) res.redirect(400, "pages/error");

    return res.render("pages/success", { theUser });
  } catch (error) {
    console.log(error);
    return res.render("pages/error");
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getReceipt,
};
```

## _Routes_

This is where the routes for the API are defined.

```js
const { Router } = require("express");
const paymentRouter = Router();
const paymentContoller = require("../controllers/payment");

paymentRouter.post("/pay", paymentContoller.initializePayment);

paymentRouter.get("/verify", paymentContoller.verifyPayment);

paymentRouter.get("/receipt/:id", paymentContoller.getReceipt);

module.exports = paymentRouter;
```

## _config_

### _connection.js_

```js
require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
let connectionString;

switch (environment) {
  case "production":
    // Point the database credentials to the production DB here
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    break;
  case "test":
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`;
    break;
  default:
    connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

module.exports = connectionString;
```

### _database.js_

```js
require("dotenv").config();
const mongoose = require("mongoose");

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  async connect() {
    try {
      const connection = await mongoose.connect(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to the database successfully");
      return connection;
    } catch (error) {
      console.log("Could not connect to the database", error);
      return error;
    }
  }
}

module.exports = Database;
```

### _connection-and-database_

> Note: if you use MongoDB make sure mongodb server is running on your local machine

These two files below are the means through which we connection can be made to the database.
Now simple configure the keys with your credentials from environment variables.

## _Models_

This is the model that interacts with the database.

```js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/* Creates the User model */
const User = mongoose.model("User", UserSchema);
module.exports = User;
```

## _Views_

The `views` folder is a default files that contains EJS pages and partials that are to be rendered in html. The views folder contains two sub-folders: `pages` and `partials`

### _pages_

This depicts the main pages that are to be rendered. It contains three (3) files:

- error.ejs

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <%- include('../partials/head') %>
  </head>

  <body style="max-width: 100%">
    <header><%- include('../partials/header') %></header>
    <div class="card" style="width: 300px; margin: 200px auto; background: #505355; text-align: center">
      <div class="card-body" style="padding: 20px; color: #fff">Sorry, your payment was not successful</div>
      <button class="btn btn-primary" style="margin: 10px auto 40px; width: 50%" href="/">Try Again</button>
    </div>
  </body>
</html>
```

- index.ejs

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <%- include('../partials/head') %>
  </head>

  <body style="max-width: 100%; background-color: antiquewhite">
    <header><%- include('../partials/header') %></header>

    <main style="justify-content: center; text-align: center">
      <div style="padding-top: 3em">
        <h1>Welcome to Easy Pay</h1>
        <p>Provide the necessary information below to make fast and efficient payment</p>
      </div>
      <div style="background: #505355; margin: auto; width: 40%; border-radius: 5px">
        <form name="myForm" action="/pay" method="POST">
          <div class="form-group">
            <input type="text" placeholder="Enter first name" name="firstName" style="width: 24em; margin: 50px 0 12px; padding: 5px 0" />
          </div>
          <div class="form-group">
            <input type="text" placeholder="Enter last name" name="lastName" style="width: 24em; margin: 20px 0; padding: 5px 0" />
          </div>
          <div class="form-group">
            <input type="email" placeholder="Enter email address" name="email" style="width: 24em; margin: 20px 0; padding: 5px 0" />
          </div>
          <div class="form-group">
            <input type="number" placeholder="Enter amount" name="amount" style="width: 24em; margin: 20px 0; padding: 5px 0" />
          </div>
          <button type="submit" class="btn btn-primary" style="margin: 10px 0 40px">Pay</button>
        </form>
      </div>
    </main>

    <footer><%- include('../partials/footer') %></footer>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
  </body>
</html>
```

- success.ejs

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <%- include('../partials/head') %>
  </head>

  <body style="max-width: 100%; background: antiquewhite">
    <header><%- include('../partials/header') %></header>
    <div class="card" style="width: 50%; margin: 100px auto; background: #fff; text-align: center; border-color: #fff">
      <div class="card" style="margin: 200px auto; background: #fff; margin: 10px 0; border-color: black; height: 400px">
        <div style="display: flex; flex-direction: row">
          <span><h6 style="font-weight: bolder; text-align: left; padding: 15px">PAYMENT RECEIPT</h6></span>
          <span>
            <div style="position: absolute; right: 10px; margin: 15px; width: 400px">
              <div>
                <span style="padding-right: 160px">No:</span>
                <span style="padding-right: 90px"><%= theUser.reference%></span>
                <hr style="color: blue" />
              </div>
              <div>
                <span style="padding-right: 150px">Date:</span>
                <span style="padding-right: 30px"><%= new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit'}).format(new Date())%></span>
                <hr style="color: blue" />
              </div>
            </div>
          </span>
        </div>
        <div style="margin-top: 70px; display: flex; flex-direction: row">
          <span
            ><p style="text-align: left; padding-left: 15px"><i>Received From:</i></p></span
          >
          <span
            ><h5 style="padding-left: 150px"><span style="padding-right: 15px"><%=theUser.lastName%></span> <span style="padding-left: 50px"><%=theUser.firstName%></span></h5></span
          >
        </div>
        <hr style="color: blue; margin: 0 25px 0 10px" />
        <div style="margin-top: 70px; display: flex; flex-direction: row">
          <span
            ><p style="text-align: left; padding-left: 15px"><i>Amount:</i></p></span
          >
          <span
            ><h5 style="padding-left: 150px"><span style="padding-left: 50px"><%=theUser.currency%></span> <span style="padding-left: 5px"><%=theUser.amount%></span></h5></span
          >
        </div>
        <hr style="color: blue; margin: 0 25px 0 10px" />
        <hr style="color: blue; margin: 0 25px 0 10px; padding: 50px" />
      </div>
    </div>
  </body>
</html>
```

### _partials_

The depicts pages that are e-usable across the entire pages, for instance: the `head`, `header` and `footer` are partials.

- head.ejs

```html
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous" />
<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap");
</style>
```

- header.ejs

```html
<nav class="navbar navbar-expand-lg bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand text-white" href="#">EasyPay</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  </div>
</nav>
```

footer.ejs

```html
<div style="position: fixed; left: 0; bottom: 0; width: 100%; background-color: black; color: white; text-align: center; padding-top: 1em; padding-bottom: 1em">
  <p class="text-center text-muted">&copy; Copyright 2022</p>
</div>
```

## Project Description

Below is a breakdown of the features this api provides:

### User Payment

Users can make payment only when they provide the following requisites: `firstName`, `lastName`, `email`, and `amount`, after which, they would be redirected to paystack's payment service, where they can make payment based on the selctions made.

Pictorial explanations below:

- Form where users input necessay data required for payment

<img width="1680" alt="Screenshot 2022-11-27 at 15 49 44" src="https://user-images.githubusercontent.com/80787295/204141987-5d6ad36a-fa35-4e87-aa14-459a85e85741.png">

- Redirect to paystack payment service after clicking the `pay` button in the form.

<img width="1680" alt="Screenshot 2022-11-27 at 15 50 52" src="https://user-images.githubusercontent.com/80787295/204142081-6af614df-5e6b-4314-b71d-38e22d34d84f.png">

- After users select their channel of payment, their payments are successful provided there are no errors during the process.

<img width="1680" alt="Screenshot 2022-11-27 at 15 51 14" src="https://user-images.githubusercontent.com/80787295/204142143-fd04ce13-22ff-4671-a08c-282781626a26.png">

After making payment, users will have to wait for the vendor(s) to verify the payment, if the verification is successful then an e-receipt is given to the them.

<img width="1680" alt="Screenshot 2022-11-27 at 15 56 52" src="https://user-images.githubusercontent.com/80787295/204142690-c3708c9e-1cc5-4f53-8a5e-3ce64a7250ea.png">
