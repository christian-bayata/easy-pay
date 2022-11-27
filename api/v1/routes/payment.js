const { Router } = require("express");
const paymentRouter = Router();
const paymentContoller = require("../controllers/payment");

paymentRouter.post("/pay", paymentContoller.initializePayment);

paymentRouter.get("/verify", paymentContoller.verifyPayment);

paymentRouter.get("/receipt/:id", paymentContoller.getReceipt);

module.exports = paymentRouter;
