const { chmodSync, existsSync } = require("fs");
const path = "./node_modules/.bin/ng";

// Only run chmod on Linux
if (process.platform !== "win32" && existsSync(path)) {
  try {
    chmodSync(path, "755");
    console.log("✅ Made ng executable on Linux.");
  } catch (err) {
    console.error("❌ chmod failed:", err.message);
  }
} else {
  console.log("ℹ️ Skipping chmod on Windows.");
}
