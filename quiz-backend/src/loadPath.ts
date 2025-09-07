import { register } from "tsconfig-paths";
import { loadConfig } from "tsconfig-paths";

const config = loadConfig();

if (config.resultType === "success") {
  register({
    baseUrl: config.absoluteBaseUrl,
    paths: config.paths,
  });
} else {
  console.error("Failed to load tsconfig paths:", config.message);
}
