const express = require("express");
const router = express.Router();
const axios = require("axios");
const {accessTokenToHeader} = require("./accessTokenToHeader");

router.get(":userName/:owner/:reqrepo", async (req, res, next) => {
    /**
     * required
     * header 
     * Authorization: put the access token here (optional Bearer)
     * params
     * userName - current user's gitHub userName 
     * the repo owner and repo name
     * 
     * process
     * automatically select the eligible pull requests from that repo
     * calculate the average
     *  
     * return 
     * the duration for each pull request and average of all pull request
     * mergeDuration : {
     *  number : pull number
     *  duration : duration in milli sec
     * } , 
     * averageDuration : averageDuration in milli sec
     */
    const { owner, reqrepo, userName } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, userName);
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all`, {
            headers: header
        })
        if(!response) res.status(404).send("not found");
        else{
        
        prData = response.data;
        const mergeDurations = [];
        let totalDuration = 0;

        prData.forEach(pr => {
            if(pr.state === "closed" && pr.merged_at){
                const createdAt = new Date(pr.created_at);
                const merged_at = new Date(pr.merged_at);
                const duration = merged_at - createdAt;
                mergeDurations.push({number: pr.number, duration});
                totalDuration += duration;
            }
        });

        const averageDuration = totalDuration / mergeDurations.length;
        const result = {mergeDurations, averageDuration};
        res.status(200).json(result);
        }
    } catch (error){
        next(error);
    }
});

router.get(":userName/:owner/:reqrepo/single_pull/:pullnumber", async (req, res, next) => {
    const { owner, reqrepo, pullnumber, userName } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, userName);
    /**
     * header 
     * Authorization: put the access token here (optional Bearer)
     * 
     * params
     * userName - current user's gitHub userName
     * require the repo owner and repo name and the pull number
     * 
     * returns
     * return the duration of the the PR from created to merged
     * return error when the Pull number is invalid.
     * return error if the PR is not closed or haven't merged yet
     * duration : duration in milliseconds
     */
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls/${pullnumber}`, {
            headers : header
        });
        if(!response) res.status(404).send("not found");
        else {
            prData = response.data;
            if(prData.state === "closed" && prData.merged_at){
                const createdAt = new Date(prData.created_at); 
                const mergedAt = new Date(prData.merged_at);
                const duration = mergedAt - createdAt;
                const result = {duration};
                res.status(200).json(result);
            } else {
                res.status(400).send("given PR does not have a merged at or its state is not closed");
            }
            
        }
    } catch (error) {
        next (error);
    }
})
/**
 * 
 * give the PR data together with the calculated duration from created to merged
 * header 
 * Authorization: put the access token here (optional Bearer)
 * 
 * params
 * owner - repo owner
 * reqrepo - repo name
 * 
 * return
 * pullRequestData - pull request data with the calculated duration. The duration is accessible
 *                    at mergeDuration 
 * averageDuration - calculated average duration in milliseconds
 */

router.get(":userName/:owner/:reqrepo/pull_data", async (req, res, next) => {
    const { userName, owner, reqrepo } = req.params;
    const header = accessTokenToHeader(req.headers.authorization, userName);
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all`, {
            headers : header
        })
        if(!response) res.status(404).send("not found");
        else{
            const responseWithCalculatedData = await calculateDuration(response.data);
            responseWithCalculatedData
                ? res.status(200).json(responseWithCalculatedData)
                : res.status(400).send("No closed pull request");
        }
        
    } catch (error) {
        next (error);
    }
})

async function calculateDuration(pullRequestsData){
    let count = 0;
    let totalDuration = 0;
    const filteredPullRequestsWithDurationData = await Promise.all(
        pullRequestsData.map(async pr => {
        
            if(pr.state === "closed" && pr.merged_at){
                const createdAt = new Date(pr.created_at);
                const merged_at = new Date(pr.merged_at);
                const mergeDuration = merged_at - createdAt;
                totalDuration += mergeDuration;
                count ++;
                return {...pr, mergeDuration}; 
            }
        })
    )
    const averageDuration = totalDuration/count;
    return {pullRequestData: filteredPullRequestsWithDurationData, averageDuration};
}


module.exports = router;