"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLambdaProxyAuthHandler = void 0;
const fastify_1 = __importDefault(require("fastify"));
const ow_1 = __importDefault(require("ow"));
const fastify_cookie_1 = require("./fastify-cookie");
const fastify_lambda_1 = require("./fastify-lambda");
const fastify_static_1 = require("./fastify-static");
const github_oauth_1 = require("./github-oauth");
const createLambdaProxyAuthHandler = (config) => {
    ow_1.default(config.cryptoSecret, "config.cryptoSecret", ow_1.default.string.nonEmpty);
    ow_1.default(config.githubClientId, "config.githubClientId", ow_1.default.string.nonEmpty);
    ow_1.default(config.githubClientSecret, "config.githubClientSecret", ow_1.default.string.nonEmpty);
    ow_1.default(config.githubOrgAdminToken, "config.githubOrgAdminToken", ow_1.default.string.nonEmpty);
    ow_1.default(config.githubOrgName, "config.githubOrgName", ow_1.default.string.nonEmpty);
    if (config.githubOrgName.includes(" "))
        config.githubOrgName = config.githubOrgName.split(" ");
    const server = fastify_1.default({ logger: true });
    fastify_cookie_1.registerCookieMiddleware(server, config);
    github_oauth_1.registerGitHubOAuth(server, config);
    fastify_static_1.registerServeStatic(server, config);
    return fastify_lambda_1.createLambdaHandler(server);
};
exports.createLambdaProxyAuthHandler = createLambdaProxyAuthHandler;
//# sourceMappingURL=index.js.map