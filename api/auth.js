const express = require("express");
const router = express.Router();
const User = require("../db/models/user");
const admin = require("firebase-admin");
const {encrypt, decrypt} = require("../auth/encryption");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  }),
});
/**
 * register the user to the database 
 * required 
 * in headers 
 * Authorization i.e.
 *  headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
    }

 * in body 
 * accessToken : github user's accessToken
 * 
 * care!
 * in idToken = either change according to have uid,username and name or 
 * change in inside code to get access to decoded data * make some test run receiving data from fontend
 * used encrypt function - not tested
 * if does not work, try using the commented code which does not use encryptedToken
 */
router.post("/register", async (req, res, next) => {

    // const idToken = req.headers.authorization.split(" ")[1];
    const decodedToken = req.body;
    const {accessToken} = req.body;
    try{
        // const decodedToken = await admin.auth().verifyIdToken(idToken);
        const id = decodedToken.uid;
        const gitHubUserName = decodedToken.username;
        const name = decodedToken.name ? decodedToken.name : decodedToken.username;
        // get user data from firebase admin if the 
        // const userRecord = await admin.auth().getUser(uid);
        let user = await User.findOne({where: {id}});
        if (!user){
            const encryptedToken = encrypt(accessToken);
            // console.log(id, gitHubUserName, name, encryptedToken)
            user = await User.create({id, gitHubUserName, name, accessToken: encryptedToken})
            //user = await User.create({id, gitHubUserName, name, accessToken}) // if encryption doesn't work
        } else {
            const encryptedToken = encrypt(accessToken);
            user = await user.update({id, gitHubUserName, name, accessToken: encryptedToken})
        }
        user
            ? res.status(200).json(user)
            : res.status(400).send("error in registering")
    } catch (error) {
        next(error)
    }
});
module.exports = router;
