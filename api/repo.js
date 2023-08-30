const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Repo, User } = require("../db/models");
const {accessTokenToHeader} = require("./accessTokenToHeader");
/**
 * get all the repo which are owned by username
 * params
 * user - current user's gitHub userName
 * username
 */
router.get(":user/:username", async (req, res, next) => {
    const githubUser = req.params.username;
    const { user } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, user);
    console.log(header);
    try {
        const allRepos = await axios.get(`https://api.github.com/users/${githubUser}/repos`,{
            headers : header
        });
        
        allRepos
            ? res.status(200).json(allRepos.data)
            : res.status(404).send("not found");
    }catch (error){
        next(error);
    }
});
/**
 * get a requested repo
 * params
 * user - current user's gitHub userName
 * owner - repo owner
 * reqrepo - name of the repo
 */
router.get(":user/:owner/:reqrepo", async (req, res, next) => {
    const {owner, reqrepo} = req.params;
    const { user } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, user);
    try{
        const repo = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}`, {
            headers: header
        });
        repo
            ? res.status(200).json(repo.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }
});
/**
 * get all pulls/pr from the requested repo
 * params
 * user - current user's gitHub userName
 * owner - repo owner
 * reqrepo - name of the repo
 */
router.get(":user/:owner/:reqrepo/pulls", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
    const { user } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, user);
    try{
        const pulls = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all`, {
            headers : header
        });
        pulls
            ? res.status(200).json(pulls.data)
            : res.status(404).send("not found");
    } catch (error) {
        next(error);
    }

});
/**
 * get a requested pull from the requested repo
 * params
 * user - current user's gitHub userName
 * owner - repo owner
 * reqrepo - name of the repo
 * pullnumber - the number of the PR
 */
router.get(":user/:owner/:reqrepo/pulls/:pullnumber", async (req, res, next) => {
    const { owner, reqrepo, pullnumber } = req.params;
    const { user } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, user);
    try{
        const pull = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls/${pullnumber}`,{
            headers : header
        });
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
/**
 * add/register a repo to our database, 
 * keys 
 * repoUrl : required
 * repoName : required
 * repoOwnerUsername : required
 * userId : optional 
 */
router.post("/add_repo", async(req, res, next) => {
    const { userId } = req.body;
    try{
        if(!req.body){
            throw new Error ("Empty request body");
        }

        let addNewRepo = await Repo.create(req.body);
        if(addNewRepo && userId){
            const user = await User.findByPk(userId);
            if (!user) req.status(404).send("User not found");
            await addNewRepo.addUser(user);
            console.log(addNewRepo);
            addNewRepo = await Repo.findByPk(addNewRepo.id, {
                include: User
            }); 
        }
        addNewRepo
            ? res.status(200).json(addNewRepo)
            : res.status(400).send("Can't add repo");

    } catch(error){
        next(error);
    }
});
/**
 * update a repo from our database, 
 * params
 * id : repo id
 * keys 
 * repoUrl : optional
 * repoName : optional
 * repoOwnerUsername : optional 
 */
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
/**
 * delete a repo from our database, 
 * params
 * id : repo id 
 */
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