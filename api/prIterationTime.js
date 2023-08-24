const express = require("express");
const router = express.Router();
const axios = require("axios");
/**
 * logic - PR iteration time
 * get all Prs 
 * for each
 *  get first comment time
 *  get last comment time (.length - 1)
 *  calculate duration
 *  put it into the array
 * calculate average use reduce
 */
router.get("/:owner/:reqrepo", async (req, res, next) =>{
    const {owner, reqrepo} = req.params;
    try {
        const pullRequestData = await fetchPullRequests(owner, reqrepo);
        if(!pullRequestData) res.status(400).send("error in fetching pull request");
        const iterationTimes  = [];
        for (const pr of pullRequestData){
            const comments = await fetchPullRequestComments(owner, reqrepo, pr.number);
            const iterationTime = calculateDuration(comments);
            if(iterationTime)
            iterationTimes.push(iterationTime);
        }
        if(iterationTimes.length == 0){
            res.status(400).send("no comments on the repo");
        }
        const totalIterationTime = iterationTimes.reduce((sum, time) => sum + time); 
        const averageIterationTime = totalIterationTime / (iterationTimes.length * 3600000);
        res.status(200).json(averageIterationTime);
    } catch (error) {
        next (error);
    }
})

async function fetchPullRequests(owner, repo){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    return response.data;
}

async function fetchPullRequestComments(owner, repo, issueNumber){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
    return response.data;
}

async function calculateDuration(comments){
    if(!comments || comments.length == 0){
        return null;
    }
    const firstCommentTime = new Date(comments[0].created_at);
    const lastCommentTime = new Date(comments[comments.length - 1].created_at);
    const duration = lastCommentTime - firstCommentTime;
    return duration;
}

module.exports = router;
