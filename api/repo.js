const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Repo } = require("../db/models");

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
        const pull = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls/${pullnumber}`);
        pull
            ? res.status(200).json(pull.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }

});

/**
 * Followings are CUD of CRUD 
 * mainly for purposing adding, deleting and updating the repos which the user
 * wants to track.
 * Not to be confused with github repo it self, since it don't use any github repo
 * so won't have any effect on the original repo.
 */
/* ------------------------- */
router.post("/add_repo", async(req, res, next) => {
    try{
        if(!req.body){
            throw new Error ("Empty request body");
        }

        const addRepo = await Repo.create(req.body);
        addRepo
            ? res.status(200).json(addRepo)
            : res.status(400).send("Can't add repo");
    } catch(error){
        next(error);
    }
});

router.put("/update_repo/:id", async (req, res, next) => {
    const repoId = req.params.id;
    const updateData = req.body;
    try {
        if(!req.body){
            throw new Error ("Empty request body");
        }

        const updatedRepo = await Repo.update(updateData, {
            where: {id: repoId}
        });
        updatedRepo 
            ? res.status(200).json(updatedRepo)
            : res.status(400).send("Update failed");

    } catch (error) {
        next(error);
    }

});

router.delete("/delete_repo/:id", async (req, res, next) => {
    const repoId = req.params.id;
    try {
        const deleteRepo = await Repo.destroy({
            where: {id: repoId}
        });
        deleteRepo
            ? res.status(200).send("Repo deleted")
            : res.status(400).send("Delete failded");
    } catch (error) {
        next(error);
    }
});
/* ------------------------- */

module.exports = router;