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

## Project Description

Below is a breakdown of the features this api provides:

### User Payment

Users can make payment only when they provide the following requisites: `firstName`, `lastName`, `email`, and `amount`, after which, they would be redirected to paystack's payment service, where they can make payment based on the selctions made.

Pictorial explanations below:
