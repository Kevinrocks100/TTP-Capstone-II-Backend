const { DataTypes } = require("sequelize");
const db = require("../db");

const Repo = db.define("repo", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    repoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    repoName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    repoOwnerUsername: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = Repo;