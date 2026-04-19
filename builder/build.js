const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function buildAPK(projectName) {
    const projectPath = path.join(__dirname, "../projects", projectName);

    console.log("🧹 Cleaning...");
    execSync(`cd ${projectPath} && ./gradlew clean`, { stdio: "inherit" });

    console.log("⚙️ Building APK...");
    execSync(`cd ${projectPath} && ./gradlew assembleDebug`, { stdio: "inherit" });

    const apk = path.join(projectPath, "app/build/outputs/apk/debug/app-debug.apk");
    const out = path.join(__dirname, "../output", projectName + ".apk");

    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(apk, out);

    console.log("✅ APK READY:", out);
}

module.exports = { buildAPK };
