const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:owner/:reqrepo/", async (req, res, next) => {
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
})
module.exports = router;