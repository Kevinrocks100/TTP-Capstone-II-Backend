const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:username", async (req, res, next) => {
    const githubUser = req.params.username;
    try {
        const allRepos = await axios.get(`https://api.github.com/users/${githubUser}/repos`);
        allRepos
            ? res.status(200).json(allRepos.data)
            : res.status(404).send("not found");
    }catch (error){
        next(error);
    }
});

router.get("/:owner/:repo", async (req, res, next) => {
    const {owner, repo} = req.params;
    try{
        const repo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        repo
            ? res.status(200).json(repo.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }
});


module.exports = router;