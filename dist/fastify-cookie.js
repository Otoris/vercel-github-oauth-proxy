"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCookieMiddleware = void 0;
const cookie_1 = __importDefault(require("@fastify/cookie"));
//
// https://github.com/fastify/fastify-cookie#fastify-cookie
//
function registerCookieMiddleware(server, config) {
    server.register(cookie_1.default, { secret: config.cryptoSecret });
}
exports.registerCookieMiddleware = registerCookieMiddleware;
//# sourceMappingURL=fastify-cookie.js.map