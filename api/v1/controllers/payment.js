const request = require("request");
const util = require("util");
const theRequest = util.promisify(request);

// const home = (req, res) => {
//   res.render("pages/index");
// };

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
      body: { firstName, lastName, email, amount: amount * 100 },
      json: true,
    };

    /* Paystack payment initialization */
    theRequest(options).then(async (resp) => {
      if (resp.body.status == true) {
        res.redirect(resp.body.data.authorization_url);
      }
      if (resp.body.status == false) {
        console.log("Resp: ", resp.body.message);
        //return Response.sendError({ res, statusCode: status.BAD_REQUEST, message: resp.body.message });
      }
    });
  } catch (error) {
    console.log(error);
    //return Response.sendFatalError({ res });
  }
};

module.exports = {
  // home,
  initializePayment,
};
