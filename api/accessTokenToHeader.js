 //const accessToken = (
//!(req.headers.authorization) || req.headers.authorization == "") 
//? process.env.GITHUB_TEMP_ACCESS_TOKEN : req.headers.authorization;)
require("dotenv").config();
const {User} = require("../db/models");
const {decrypt} = require("../auth/encryption");
async function accessTokenToHeader(reqAccessToken, gitHubUserName){
    let accessToken = ""
    //for all possible null cases
    if(!(reqAccessToken) || reqAccessToken === "") {
        let userInfo
        if(gitHubUserName){
            userInfo = await User.findOne({
                where: {gitHubUserName}
            });
        }
        if(userInfo){
            accessToken = decrypt(userInfo.accessToken)
        }
        if(accessToken === ""){
            accessToken =  process.env.GITHUB_TEMP_ACCESS_TOKEN;
        }
        
    } else {
        //keeping the old style of getting accessToken
        const accessTokenSeparator = reqAccessToken.split(" ");

        if(accessTokenSeparator[1]){
            accessToken = accessTokenSeparator[2];
        } else {
            accessToken = reqAccessToken;
        }
    }
   
    return {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`, 
        "X-GitHub-Api-Version": "2022-11-28"
    }
}
module.exports = {accessTokenToHeader};