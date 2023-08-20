const { DataTypes } = require("sequelize");
const db = require("../db");

const User = db.define("user", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, 
        allowNull: false, //won't allow null value and if the input wasn't given put username here
    },
    gitHubUserName: {
        type: DataTypes.STRING,
        allowNull: false
    }
});
module.exports = User;