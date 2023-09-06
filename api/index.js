const router = require("express").Router();
router.use("/repo", require("./repo"));
router.use("/calculate_merge_duration", require("./calculateMergeDuration"));
router.use("/time_to_first_comment", require("./timeToFirstComment"));
router.use("/unreviewed_pr_percentage",require("./unreviewedPRs"));
router.use("/responsiveness", require("./responsiveness"))
router.use("/follow_on_commit", require("./followOnCommit"))
router.use("/pr_interation_time", require("./prIterationTime"))
router.use("/auth", require("./auth"));
router.use("/user", require("./user"));
router.use((req, res, next) => {
    // const error = new Error("404 Not Found");
    // error.status = 404;
    // next(error);
    console.log("rdy api");
  });

  module.exports = router;
