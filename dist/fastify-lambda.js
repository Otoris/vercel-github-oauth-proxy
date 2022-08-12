"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLambdaHandler = void 0;
//
// https://www.fastify.io/docs/latest/Serverless/#vercel
// https://vercel.com/docs/serverless-functions/supported-languages#using-typescript
//
const createLambdaHandler = (server) => {
    return async (req, res) => {
        await server.ready();
        server.server.emit("request", req, res);
    };
};
exports.createLambdaHandler = createLambdaHandler;
//# sourceMappingURL=fastify-lambda.js.map