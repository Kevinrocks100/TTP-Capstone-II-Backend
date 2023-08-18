const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:owner/:reqrepo/", async (req, res, next) => {
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