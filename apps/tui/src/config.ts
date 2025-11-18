import { join } from "path";
import { homedir } from "os";

const PATH = join(homedir(), ".local", "share", "money");
const AUTH_PATH = join(PATH, "auth.json");

export const config = {
  dir: PATH,
  authPath: AUTH_PATH,
  zeroUrl: "http://laptop:4848",
};
