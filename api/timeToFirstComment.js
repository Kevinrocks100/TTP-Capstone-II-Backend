const express = require("express");
const router = express.Router();
const axios = require("axios");
const {accessTokenToHeader} = require("./accessTokenToHeader");
let header = "";

/**
 * logic - Time to first comment
 * get all Prs 
 * for each pr -> get createdAt and get comment[0].createdAt?
 * cal duration
 * return either only duration or whole PRs
 * have to test it out "real" repos where a lot of comment in PRs?
 */

/**
 * give the PR data together with the calculated duration from created to first comment created
 * header 
 * Authorization: put the access token here (optional Bearer)
 * 
 * params
 * owner - repo owner
 * reqrepo - repo name
 * 
 * return
 * pull request data with the calculated duration. The duration is accessible at timeToFirstComment
 */
router.get(":userName/:owner/:reqrepo/pull_data", async (req, res, next) => {
    const { owner, reqrepo, userName } = req.params;
    header = accessTokenToHeader(req.headers.authorization, userName);
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
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
        headers: header
    });
    return response.data;
}

async function fetchPullRequestsComments(owner, repo, issueNumber) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        headers: header
    });
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