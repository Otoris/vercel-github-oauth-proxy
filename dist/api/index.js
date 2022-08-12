"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const lib_1 = require("../lib");
exports.default = lib_1.createLambdaProxyAuthHandler({
    cryptoSecret: process.env.CRYPTO_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubOrgAdminToken: process.env.GITHUB_ORG_ADMIN_TOKEN,
    githubOrgName: process.env.GITHUB_ORG_NAME,
    staticDir: path_1.default.resolve(__dirname, "../static"),
    sessionDurationSeconds: 604800, // 1 week
});
//# sourceMappingURL=index.js.map