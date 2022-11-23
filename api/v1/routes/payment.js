const { Router } = require("express");
const paymentRouter = Router();
const paymentContoller = require("../controllers/payment");

paymentRouter.post("/initialize-payment", paymentContoller.initializePayment);

module.exports = paymentRouter;
