require("dotenv").config();
const { Sequelize } = require("sequelize");
const db = new Sequelize(process.env.POSTGRES_URL + "?sslmode=require", {
    logging: false,
});

module.exports = db;