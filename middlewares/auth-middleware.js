// middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [authType, authToken] = (authorization || "").split(" ");

    if (!authToken || authType !== "Bearer") {
        res.status(401).send({
            errorMessage: "This function is available after logging in.",
        });
        return;
    }

    try {
        const { userId } = jwt.verify(authToken, "customized-secret-key");
        User.findById(userId).then((user) => {
            res.locals.user = user;
            next();
        });
    } catch (err) {
        res.status(401).send({
            errorMessage: "This function is available after logging in.",
        });
    }
};