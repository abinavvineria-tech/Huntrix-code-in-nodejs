const express = require("express");
const fs = require("fs");
const path = require("path");
const { buildAPK } = require("./builder/build");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

const usersPath = "./db/users.json";

// 🔧 helpers
function loadUsers() {
    return JSON.parse(fs.readFileSync(usersPath));
}

function saveUsers(data) {
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

// =====================
// 🔐 LOGIN
// =====================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const users = loadUsers();

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

// =====================
// 🆕 SIGNUP
// =====================
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    let users = loadUsers();

    const exists = users.find(u => u.username === username);
    if (exists) {
        return res.json({ status: "exists" });
    }

    const newUser = {
        id: users.length + 1,
        username,
        password,
        token: Math.random().toString(36).substring(2),
        role: "user"
    };

    users.push(newUser);
    saveUsers(users);

    res.json({
        status: "created",
        token: newUser.token
    });
});

// =====================
// 🔐 CHANGE PASSWORD
// =====================
app.post("/change-password", (req, res) => {
    const { token, oldPassword, newPassword } = req.body;

    let users = loadUsers();

    const user = users.find(u => u.token === token);

    if (!user) {
        return res.json({ status: "invalid token" });
    }

    if (user.password !== oldPassword) {
        return res.json({ status: "wrong password" });
    }

    user.password = newPassword;

    saveUsers(users);

    res.json({ status: "password updated" });
});

// =====================
// 🚀 BUILD APK
// =====================
app.post("/build", (req, res) => {
    const { token, project } = req.body;

    const users = loadUsers();
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

// =====================
// 🌐 START SERVER
// =====================
app.listen(PORT, () => {
    console.log("☁️ Huntrix Cloud running on http://localhost:" + PORT);
});
