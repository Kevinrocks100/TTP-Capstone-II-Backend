const express = require("express");
const router = express.Router();
const axios = require("axios");

/**
 * logic - Unreviewed PRs
 * get all Prs -> get allCount
 * for each Pr 
 * -> get comment -> if empty then true, so targetPRcount++
 * -> get approvals? ->is in pullnumber/reviews and its !(state == APPROVED)-> if none then true so targetPRcount++
 * get a percentage
 */
router.get("/:owner/:reqrepo", async (req, res, next) => {
    const { owner, reqrepo } = req.params;
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
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    return response.data;
}

async function fetchPullRequestsReviews(owner, repo, pullNumber){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`);
    return response.data;
}
module.exports = router;

