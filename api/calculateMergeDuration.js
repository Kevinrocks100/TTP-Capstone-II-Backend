const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:owner/:reqrepo", async (req, res, next) => {
    /**
     * 
     * require the repo owner and repo name
     * automatically select the eligible pull requests from that repo
     * calculate the average 
     * return the duration for each pull request and average of all pull request
     * mergeDuration : {
     *  number : pull number
     *  duration : duration in milli sec
     * } , 
     * averageDuration : averageDuration in milli sec
     */
    const { owner, reqrepo } = req.params;
    
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls?state=all`)
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

router.get("/:owner/:reqrepo/single_pull/:pullnumber", async (req, res, next) => {
    const { owner, reqrepo, pullnumber } = req.params;
    /**
     * 
     * require the repo owner and repo name and the pull number
     * return the duration of the the PR from created to merged
     * return error when the Pull number is invalid.
     * return error if the PR is not closed or haven't merged yet
     * duration : duration in milliseconds
     */
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${reqrepo}/pulls/${pullnumber}`);
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
module.exports = router;