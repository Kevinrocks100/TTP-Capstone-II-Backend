const router = require("express").Router();
router.use("/repo", require("./repo"));
router.use((req, res, next) => {
    // const error = new Error("404 Not Found");
    // error.status = 404;
    // next(error);
    console.log("rdy api");
  });

  module.exports = router;
