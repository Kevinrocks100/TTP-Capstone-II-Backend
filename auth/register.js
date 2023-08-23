const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const keyData = require("../apikeys/ttp-capstone-ii-firebase-adminsdk-2x4wp-2e0e6d47a0.json");
const {User} = require("../db/models");
const {encrypt, decrypt} = require("./encryption");
// const {initializeApp} = require("firebase-admin/app");
admin.initializeApp({
    credential: admin.credential.cert(keyData)
});
router.post("/", (req, res) => {
    const token = req.header("Authorization".replace("Bearer ", ""));

    admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
            /**
             * 
             */
            const id = decodedToken.uid;
            const gitHubUserName = decodedToken.username;
            const name = decodedToken.name ? decodedToken.name : decodedToken.username;
            const {accessToken} = req.body;
            User.findOne({where: {id}})
                .then((user) => {
                    if(user){
                        res.status(409).json({ error: "User already registered" });
                    } else {
                        const encryptedToken = encrypt(accessToken)
                        User.create({id, gitHubUserName, name, accessToken: encryptedToken})
                        //User.create({id, gitHubUserName, name, accessToken}) // if encryption don't work
                            .then((user) => res.json(user))
                            .catch((err) => {
                                res.status(500).json({ error: "Failed to register User"})
                            })
                    }
                })
                .catch((err) => {
                    res.status(500).json({error: "Failed to check"});
                })
        })
        .catch((error) => {
            res.status(401).json({error: "Unauth"});
        });
});
module.exports =router;

