const express = require("express");
const router = express.Router();
const axios = require("axios");
const {accessTokenToHeader} = require("./accessTokenToHeader");
let header = "";

/**
 * logic - Follow on commit 
 * get all PRs
 * for each pr -> 
 * pr has base and head which is the first and current commit
 *  referenced with sha
 * use compare github end point to get all commits between the two
 * esp when we use start and end we can get all commits from the start to cur commit 
 */

router.get("/:owner/:reqrepo/pull_data", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
    header = accessTokenToHeader(req.headers.authorization);
    try{
        const responseWithCalculatedData = await calculateCommitCount(owner, reqrepo);
        responseWithCalculatedData
            ? res.status(200).json(responseWithCalculatedData)
            : res.status(400).send("Error in getting response");
    } catch (error) {
        next(error);
    }

});

async function fetchPullRequests(owner, repo) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
        headers: header
    });
    return response.data;
}

async function fetchCommits(owner, repo, baseCommit, compareCommit) {
    //get all commits between the two commit
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/compare/${baseCommit}...${compareCommit}`, {
        headers: header
    });
    return response.data.commits.map(commit => ({
        sha: commit.sha,
        timestamp: commit.commit.author.date,
    }));
}

async function calculateCommitCount(owner, repo){
    try{
        const pullRequests = await fetchPullRequests(owner, repo);
        const pullRequestsWithCalculatedData = await Promise.all(
            pullRequests.map(async pr => {
                const commits = await fetchCommits(owner, repo, pr.base.sha, pr.head.sha);
                const followOnCommitCount = commits.length;
                return{...pr, followOnCommitCount};
            })
        )
        return pullRequestsWithCalculatedData;
    } catch(error){
        throw error;
    }
}

module.exports = router;