const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res, next) => {
    try {
        const allRepos = await axios.get("https://api.github.com/users/kyawnanda27/repos")
        allRepos
            ? res.status(200).json(allRepos.data)
            : res.status(404).send("not found")
    }catch (error){
        next(error);
    }
});
module.exports = router;