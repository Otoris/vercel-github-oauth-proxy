"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerServeStatic = void 0;
const static_1 = __importDefault(require("@fastify/static"));
const globby_1 = __importDefault(require("globby"));
const path_1 = __importDefault(require("path"));
//
// Unfortunately I couldn't make fastify-static add a fallback to /path/index.html when /path is requested.
// Therefore this collects those fallbacks once on startup.
//
function collectFallbacks(staticDir) {
    const files = globby_1.default.sync("", { cwd: staticDir, onlyFiles: true });
    const fallbacks = files.reduce((result, filename) => {
        if (!filename.includes("/")) {
            return result;
        }
        if (!filename.endsWith(".html") && !filename.endsWith(".htm")) {
            return result;
        }
        const directory = path_1.default.dirname(filename);
        const url = "/" + directory;
        if (result[url]) {
            return result;
        }
        if (!result[directory]) {
            const fallbackDir = path_1.default.resolve(staticDir, directory);
            result["/" + directory] = fallbackDir;
        }
        return result;
    }, {});
    return fallbacks;
}
//
// https://github.com/fastify/fastify-static#fastify-static
//
function registerServeStatic(server, config) {
    const fallbacks = collectFallbacks(config.staticDir);
    server.setNotFoundHandler(async (req, res) => {
        const fallbackDir = fallbacks[req.url];
        if (fallbackDir) {
            res.sendFile("index.html", fallbackDir);
        }
        else {
            res.sendFile("index.html", config.staticDir);
        }
    });
    server.register(static_1.default, {
        root: path_1.default.resolve(config.staticDir),
        extensions: ["html", "htm"],
    });
}
exports.registerServeStatic = registerServeStatic;
//# sourceMappingURL=fastify-static.js.map