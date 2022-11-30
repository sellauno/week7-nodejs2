// app.js

const express = require("express");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/shopping-demo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();


const User = require("./models/user");

// Sign in API
router.post("/users", async (req, res) => {
    const { email, nickname, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        res.status(400).send({
            errorMessage: "Password is different from password checkbox",
        });
        return;
    }

    // Get the same email or nickname to check if it already exists.
    const existsUsers = await User.findOne({
        $or: [{ email }, { nickname }],
    });
    if (existsUsers) {
        // NOTE: For security reasons, the authentication message should not be described in detail: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
        res.status(400).send({
            errorMessage: "Email or nickname is already in use.",
        });
        return;
    }

    const user = new User({ email, nickname, password });
    await user.save();

    res.status(201).send({});
});

const jwt = require("jsonwebtoken");

router.post("/auth", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // NOTE: In principle, the authentication message is not explained in detail: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
    if (!user || password !== user.password) {
        res.status(400).send({
            errorMessage: "Your email or password is incorrect.",
        });
        return;
    }

    res.send({
        token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
    });
});

const authMiddleware = require("./middlewares/auth-middleware");

router.get("/users/me", authMiddleware, async (req, res) => {
    res.send({ user: res.locals.user });
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
    console.log("Server is ready to receive requests");
});