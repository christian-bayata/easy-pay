const { Router } = require("express");
const paymentRouter = Router();
const paymentContoller = require("../controllers/payment");

//paymentRouter.get("/home", paymentContoller.home);

paymentRouter.post("/pay", paymentContoller.initializePayment);

module.exports = paymentRouter;
