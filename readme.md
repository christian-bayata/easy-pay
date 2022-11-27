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

- Form where users input necessay data required for payment

<img width="1680" alt="Screenshot 2022-11-27 at 15 49 44" src="https://user-images.githubusercontent.com/80787295/204141987-5d6ad36a-fa35-4e87-aa14-459a85e85741.png">

- Redirect to paystack payment service after clicking the `pay` button in the form.

<img width="1680" alt="Screenshot 2022-11-27 at 15 50 52" src="https://user-images.githubusercontent.com/80787295/204142081-6af614df-5e6b-4314-b71d-38e22d34d84f.png">

- After users select their channel of payment, their payments are successful provided there are no errors during the process.

<img width="1680" alt="Screenshot 2022-11-27 at 15 51 14" src="https://user-images.githubusercontent.com/80787295/204142143-fd04ce13-22ff-4671-a08c-282781626a26.png">


