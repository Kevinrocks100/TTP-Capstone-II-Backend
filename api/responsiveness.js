const express = require("express");
const router = express.Router();
const axios = require("axios");
const {accessTokenToHeader} = require("./accessTokenToHeader");
let header = "";

/**
 * logic - Responsiveness - average duration it takes a submitter to respond to a comment
 * on their pull request
 * get all PRs
 * for each PR -> get all comments 
 * -> put all the comments in map with their index being their id
 * -> for each comment check if it is the reply with
 *                                      in_reply_to_id
 * -> if it is the reply then get the comment at [in_reply_to_id] from the map
 * -> also ready for that comment's created_at
 * have the difference and put it into the array
 * when the comments are all checked, calculate based on the array
 * if array is blank return 0 or null if not return the average with PR data
 */
/**
 * give the PR data together with the calculated duration from the comment made to reply by the creator of that PR
 * header
 * Authorization: put the access token here (optional Bearer)
 * 
 * params
 * owner - repo owner
 * reqrepo - repo name
 * 
 * return
 * pull request data with the calculated duration. The duration is accessible at responsivenessData
 */
router.get("/:owner/:reqrepo", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
    header = accessTokenToHeader(req.headers.authorization);
    try {
        const responseWithCalculatedData = await calculateResponsiveness(owner, reqrepo);
        responseWithCalculatedData
            ? res.status(200).json(responseWithCalculatedData)
            : res.status(400).send("Error in getting response");
    } catch (error) {
        next (error)
    }
});

async function fetchPullRequests(owner, repo) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {
        headers: header
    });
    return response.data;
}

async function fetchPullRequestsComments(owner, repo, issueNumber){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        headers: header
    });
    return response.data;
}

async function calculateAverageResponseTime(comments, prOwner){
    if(comments.length === 0) {
        return 0;
    }


    const commentMap = new Map();
    comments.forEach(comment => {
        commentMap.set(comment.id, comment);
    });
    const responseTimes = []
    comments.forEach(comment => {
        const inReplyTo = comment.in_reply_to_id;
        if(inReplyTo && commentMap.has(inReplyTo) && (prOwner === comment.user.login)) {
            const originalComment = commentMap.get(inReplyTo);
            const originalCommentTime = new Date(originalComment.created_at);
            const replyTime = new Date (comment.created_at);
            const timeDifference = replyTime - originalCommentTime;
            responseTimes.push(timeDifference);
        }
    });
    if(responseTimes.length === 0){
        return 0;
    }

    const totalRespnseTime = responseTimes.reduce((sum, target) => sum + target, 0);
    const averageResponseTime = totalRespnseTime / responseTimes.length;
    return averageResponseTime;

}

async function calculateResponsiveness(owner, repo) {
    try {
        const pullRequests = await fetchPullRequests(owner, repo);
        
        const pullRequestsWithCalculatedData = await Promise.all(
            pullRequests.map(async pr => {
                const comments = await fetchPullRequestsComments(owner, repo, pr.number);
                const responsivenessData = await calculateAverageResponseTime(comments, pr.user.login);
                // return {...pr, responsivenessData};
                if(responsivenessData.length > 0){
                    return {...pr, responsivenessData};
                } else {
                    return {...pr, responsivenessData: null}
                }
            })
        );
        return pullRequestsWithCalculatedData;

    } catch (error) {
        throw error;
    }
}
module.exports = router;
