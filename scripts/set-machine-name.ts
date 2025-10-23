import { execSync } from "child_process";
import fs from "fs";

const ENV_FILE = ".env.dev";
const VARIABLE_NAME = "EXPO_PUBLIC_TAILSCALE_MACHINE";

try {
  const json = execSync("tailscale status --self --json", { encoding: "utf8" });
  const data = JSON.parse(json);
  const machine = data?.Self?.DNSName.split(".")[0];

  if (!machine) {
    console.error("Error: could not retrieve Tailscale machine name");
    process.exit(1);
  }

  let content = "";
  if (fs.existsSync(ENV_FILE)) {
    content = fs.readFileSync(ENV_FILE, "utf8");
  }

  const pattern = new RegExp(`^${VARIABLE_NAME}=.*`, "m");
  if (pattern.test(content)) {
    content = content.replace(pattern, `${VARIABLE_NAME}=${machine}`);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    content += `${VARIABLE_NAME}=${machine}\n`;
  }

  fs.writeFileSync(ENV_FILE, content, "utf8");
  console.log(`Updated ${ENV_FILE} with ${VARIABLE_NAME}=${machine}`);
} catch (err) {
  console.error("Failed to update .env.dev:", err);
  process.exit(1);
}

