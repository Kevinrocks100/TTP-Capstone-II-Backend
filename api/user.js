const express = require("express");
const router = express.Router();
const {User} = require("../db/models");
const {decrypt} = require("../auth/encryption");

router.get("/find/username/:username", async (req, res, next) => {
    const gitHubUserName = req.params.username;
    try{
        const userInfo = await User.findOne({
            where: {gitHubUserName}
        });
        if(userInfo){
            /* --------------------------- */ /* Dont use this if u do not need to decrypt access token */
            const decryptAccessToken = decrypt(userInfo.accessToken);
            userInfo.accessToken = decryptAccessToken;
            /* --------------------------- */
            res.status(200).json(userInfo);
        }
        res.status(400).send("Error on getting user");

    } catch (error) {
        next(error)
    }
});
router.get("/find/id/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        const userInfo = await User.findByPk(id);
        if(userInfo){
            /* --------------------------- */ /* Dont use this if u do not need to decrypt access token */
            const decryptAccessToken = decrypt(userInfo.accessToken);
            userInfo.accessToken = decryptAccessToken;
            /* --------------------------- */
            res.status(200).json(userInfo);
        }
        res.status(400).send("Error on getting user");
    } catch (error) {
        next (error);
    }
})
module.exports = router;