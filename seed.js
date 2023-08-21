require('dotenv').config();
const db = require("./db");
const { User, Repo } = require("./db/models");

const userSeed = [
    {
        "id": "firebase_id_1",
        "name": "Knd",
        "gitHubUserName": "kyawnanda27",
        "accessToken": "ac1"
    },
    {
        "id": "firebase_id_2",
        "name": "John Doe",
        "gitHubUserName": "johndoe123",
        "accessToken": "ac2"
    },
    {
        "id": "firebase_id_3",
        "name": "Jane Doe",
        "gitHubUserName": "janedoe123",
        "accessToken": "ac1"
    },

];

const repoSeed = [
    {
       "repoUrl": "https://github.com/jons-repo/CRUD-App-Backend",
       "repoName": "CRUD-App-Backend",
       "repoOwnerUsername": "jons-repo",
    },
    {
        "repoUrl": "https://github.com/PicConnnect/PicConnect_Frontend",
        "repoName": "PicConnect_Frontend",
        "repoOwnerUsername": "PicConnnect",
    }
];

const seed = async() => {
    console.log("here in seed")
    await db.sync({force: true});

    await User.bulkCreate(userSeed);
    await Repo.bulkCreate(repoSeed);

    try {
        const userIds = ["firebase_id_1", "firebase_id_2"];
        const repo = await Repo.findByPk(1);
        const users = await User.findAll({
            where: {
                id: userIds
            },
        });
        await repo.addUser(users);
    } catch (error) {
        console.error("it is an error", error);
    }
};

seed().then(() => process.exit());