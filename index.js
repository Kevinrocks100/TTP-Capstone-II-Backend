require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const PORT = process.env.PORT || 8000;
const http = require("http");

const setupMiddleWare = (app) => {
    app.use(
        cors({
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
};

const setupRoutes = (app) => {
    app.use("/api", require("./api"));
    app.get("/", () => {
        console.log("at root or home route");
    });
};

const startServer = async (server, port) => {
    await db.sync();
    server.listen(port, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    return server;
}

const configureApp = (port) => {
    const app = express();
    setupMiddleWare(app);
    setupRoutes(app);

    const server = http.createServer(app);
    return startServer(server, port);
}

module.exports = configureApp(PORT);

