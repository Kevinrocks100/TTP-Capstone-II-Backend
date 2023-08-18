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

router.get("/:owner/:reqrepo", async (req, res, next) => {
    const {owner, reqrepo} = req.params;
    try{
        const repo = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}`);
        repo
            ? res.status(200).json(repo.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }
});

router.get("/:owner/:reqrepo/pulls", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
    try{
        const pulls = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all`);
        pulls
            ? res.status(200).json(pulls.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }

});

router.get("/:owner/:reqrepo/pulls/:pullnumber", async (req, res, next) => {
    const { owner, reqrepo, pullnumber } = req.params;
    try{
        const pull = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all/${pullnumber}`);
        pull
            ? res.status(200).json(pull.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }

});


module.exports = router;