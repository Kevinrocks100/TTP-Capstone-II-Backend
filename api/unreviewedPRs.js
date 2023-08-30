const express = require("express");
const router = express.Router();
const axios = require("axios");
const {accessTokenToHeader} = require("./accessTokenToHeader");
let header = ""

/**
 * logic - Unreviewed PRs
 * get all Prs -> get allCount
 * for each Pr 
 * -> get comment -> if empty then true, so targetPRcount++
 * -> get approvals? ->is in pullnumber/reviews and its !(state == APPROVED)-> if none then true so targetPRcount++
 * get a percentage
 */

/**
 * give the percentage of the pull requests that are closed without review
 * header 
 * Authorization: put the access token here (optional Bearer)
 * 
 * params
 * owner - repo owner
 * reqrepo - repo name
 * 
 * return 
 * percentage : percentage of unreviewed pull requests
 */
router.get(":userName/:owner/:reqrepo", async (req, res, next) => {
    const { owner, reqrepo, userName } = req.params;
    header = accessTokenToHeader(req.headers.authorization, userName);
    try{

        const pullRequestsData = await fetchPullRequests(owner, reqrepo);
        let unReviewedPRcount = 0;
        console.log("here");
        console.log(pullRequestsData);
        for (const pr of pullRequestsData){
            const reviewsResponse = await fetchPullRequestsReviews(owner, reqrepo, pr.number);

            if(reviewsResponse.length == 0){
                unReviewedPRcount++
            }
        }
        const totalPRcount = pullRequestsData.length;
        const unReviewedPRpercentage = (unReviewedPRcount / totalPRcount) * 100;
        pullRequestsData
            ? res.status(200).json({percentage: unReviewedPRpercentage})
            : res.status(400).send("Error in request data");

    } catch (error) {
        next(error);
    }
});

async function fetchPullRequests(owner, repo){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`,{
        headers: header
    });
    return response.data;
}

async function fetchPullRequestsReviews(owner, repo, pullNumber){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
        headers: header
    });
    return response.data;
}
module.exports = router;

