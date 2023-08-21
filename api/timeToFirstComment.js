const express = require("express");
const router = express.Router();
const axios = require("axios");

/**
 * logic - Time to first comment
 * get all Prs 
 * for each pr -> get createdAt and get comment[0].createdAt?
 * cal duration
 * return either only duration or whole PRs
 * have to test it out "real" repos where a lot of comment in PRs?
 */

/**
 * 
 * 
 */
router.get("/:owner/:reqrepo", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
    try {
        const responseWithCalculatedData = await calculateTimeToFirstCommit(owner, reqrepo);
        responseWithCalculatedData
            ? res.status(200).json(responseWithCalculatedData)
            : res.status(400).send("Error in getting response");
    } catch (error) {
        next(error);
    }

});

async function fetchPullRequests(owner, repo) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    return response.data;
}

async function fetchPullRequestsComments(owner, repo, issueNumber) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
    return response.data;
}

async function calculateTimeToFirstCommit(owner, repo){
    try {
        const pullRequests = await fetchPullRequests(owner, repo);
        const pullRequestsWithCalculatedData = await Promise.all(
            pullRequests.map(async pr => {
                const comments = await fetchPullRequestsComments(owner, repo, pr.number);
                const createdAt = new Date(pr.created_at);

                if(comments.length > 0){
                    const firstCommentCreatedAt = new Date (comments[0].created_at);
                    const timeToFirstComment = firstCommentCreatedAt - createdAt;
                    return{...pr, timeToFirstComment};
                } else {
                    return{...pr, timeToFirstComment: null}
                }
            })
        );
        return pullRequestsWithCalculatedData;
    } catch (error) {
        throw error;
    }
}
module.exports = router;