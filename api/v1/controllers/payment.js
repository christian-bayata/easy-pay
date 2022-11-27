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
