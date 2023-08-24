 //const accessToken = (
//!(req.headers.authorization) || req.headers.authorization == "") 
//? process.env.GITHUB_TEMP_ACCESS_TOKEN : req.headers.authorization;)
require("dotenv").config();    
function accessTokenToHeader(reqAccessToken){
    let accessToken = ""
    if(!(reqAccessToken) || reqAccessToken == "") {
        accessToken =  process.env.GITHUB_TEMP_ACCESS_TOKEN;
    } else {
        const accessTokenSeparator = reqAccessToken.split(" ");

        if(accessTokenSeparator[1]){
            accessToken = accessTokenSeparator[2];
        } else {
            accessToken = reqAccessToken;
        }
    }
   
    
    
    return {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
    }
}
module.exports = {accessTokenToHeader};