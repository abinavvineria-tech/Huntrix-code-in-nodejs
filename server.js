const express = require("express");
const fs = require("fs");
const path = require("path");
const { buildAPK } = require("./builder/build");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

const users = require("./db/users.json");

// 🔐 LOGIN SYSTEM
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.json({ status: "failed" });
    }

    res.json({
        status: "success",
        token: user.token,
        username: user.username
    });
});

// 📦 BUILD APK
app.post("/build", (req, res) => {
    const { token, project } = req.body;

    const user = users.find(u => u.token === token);

    if (!user) {
        return res.json({ status: "unauthorized" });
    }

    buildAPK(project);

    res.json({
        status: "building",
        project
    });
});

// 🌐 DASHBOARD PAGE
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.listen(PORT, () => {
    console.log("🌐 Huntrix Web Cloud running on http://localhost:" + PORT);
});
