import { NowApiHandler } from "@vercel/node";
import { Config } from "./types";
export declare const createLambdaProxyAuthHandler: (config: Config) => NowApiHandler;
export type { Config } from "./types";
