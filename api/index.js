const router = require("express").Router();
router.use("/test", require("./test"));
router.use((req, res, next) => {
    // const error = new Error("404 Not Found");
    // error.status = 404;
    // next(error);
    console.log("rdy api");
  });

  module.exports = router;
