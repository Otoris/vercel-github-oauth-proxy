import { NowApiHandler } from "@vercel/node";
import { FastifyInstance } from "fastify";
export declare const createLambdaHandler: (server: FastifyInstance) => NowApiHandler;
