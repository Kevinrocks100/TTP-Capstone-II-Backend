const Repo = require("./repo");
const User = require("./user");

Repo.belongsToMany(User, {through: "user_repo"});
User.belongsToMany(Repo, {through: "user_repo"});

module.exports = {
    Repo,
    User
};