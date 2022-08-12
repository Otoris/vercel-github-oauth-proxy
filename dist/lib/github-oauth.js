"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGitHubOAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const nanoid_1 = require("nanoid");
const url_1 = require("url");
function registerGitHubOAuth(server, config) {
    const secureCookies = !!process.env.VERCEL_URL;
    const urls = {
        localAuthorize: "/login/oauth/authorize",
        localMembershipError: "/login/oauth/error-membership",
        localGenericError: "/login/oauth/error",
        githubAuthorize: "https://github.com/login/oauth/authorize",
        githubToken: "https://github.com/login/oauth/access_token",
        githubOrgMembers: Array.isArray(config.githubOrgName) ? config.githubOrgName.map((orgName) => `https://api.github.com/orgs/${orgName}/members`) : `https://api.github.com/orgs/${config.githubOrgName}/members`,
        githubUserDetails: "https://api.github.com/user",
    };
    const cookieNames = {
        state: "state",
        user: "user",
    };
    const formatQueryParams = (params) => {
        return "?" + new url_1.URLSearchParams(params).toString();
    };
    const unsignCookie = (res, value) => {
        const unsigned = res.unsignCookie(value);
        if (unsigned.valid) {
            return JSON.parse(unsigned.value || "null");
        }
    };
    /**
     * Make sure the authentication request was initiated by this application.
     */
    const initiateOAuth = async (req, res) => {
        const state = {
            randomToken: nanoid_1.nanoid(),
            path: req.url,
        };
        res.clearCookie(cookieNames.user);
        res.setCookie(cookieNames.state, JSON.stringify(state), {
            httpOnly: true,
            maxAge: config.sessionDurationSeconds,
            path: "/",
            sameSite: "lax",
            secure: secureCookies,
            signed: true,
        });
        res.redirect(302, urls.localAuthorize);
    };
    //
    // https://docs.github.com/en/free-pro-team@latest/developers/apps/authorizing-oauth-apps#web-application-flow
    //
    const redirectToGitHub = async (req, res) => {
        var _a;
        const query = formatQueryParams({
            client_id: config.githubClientId,
            scope: "read:user",
            state: (_a = req.cookies[cookieNames.state]) !== null && _a !== void 0 ? _a : "",
        });
        res.redirect(302, urls.githubAuthorize + query);
    };
    const denyAccess = async (res, message) => {
        res.clearCookie(cookieNames.user);
        res.clearCookie(cookieNames.state);
        res.status(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message,
        });
    };
    const getGitHubAccessToken = async (code) => {
        const url = urls.githubToken;
        const headers = {
            Accept: "application/json",
        };
        const body = {
            client_id: config.githubClientId,
            client_secret: config.githubClientSecret,
            code,
        };
        const { data } = await axios_1.default.post(url, body, { headers });
        return data;
    };
    const getGitHubUser = async (tokenData) => {
        const url = urls.githubUserDetails;
        const headers = {
            Accept: "application/json",
            Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        };
        const { data } = await axios_1.default.get(url, { headers });
        return data;
    };
    const getGitHubOrgMemberships = async (page = 1, index) => {
        const url = (Array.isArray(urls.githubOrgMembers) && index) ? urls.githubOrgMembers[index] : urls.githubOrgMembers;
        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${config.githubOrgAdminToken}`,
        };
        const params = {
            per_page: 100,
            page,
        };
        const { data } = await axios_1.default.get(url, { headers, params });
        return data;
    };
    const retrieveState = (req, res) => {
        const state = unsignCookie(res, req.query.state || "");
        const expectedState = unsignCookie(res, req.cookies[cookieNames.state] || "");
        if (!(state === null || state === void 0 ? void 0 : state.randomToken) ||
            state.randomToken !== (expectedState === null || expectedState === void 0 ? void 0 : expectedState.randomToken)) {
            throw new Error("State mismatch");
        }
        return state;
    };
    const succeed = (res, user, path) => {
        res.setCookie(cookieNames.user, JSON.stringify(user), {
            httpOnly: false,
            maxAge: config.sessionDurationSeconds,
            path: "/",
            sameSite: "lax",
            secure: secureCookies,
            signed: false,
        });
        res.redirect(302, path);
    };
    //
    // https://www.fastify.io/docs/latest/Hooks/
    //
    server.addHook("preValidation", async (req, res) => {
        try {
            if (req.url === urls.localMembershipError) {
                return denyAccess(res, "It appears you are not a member of the required GitHub organization.");
            }
            if (req.url === urls.localGenericError) {
                return denyAccess(res, "It appears that the authentication request was initiated or processed incorrectly.");
            }
            if (req.url === urls.localAuthorize) {
                return redirectToGitHub(req, res);
            }
            if (req.cookies[cookieNames.state] && req.cookies[cookieNames.user]) {
                if (req.query.state || req.query.code) {
                    const state = retrieveState(req, res);
                    return res.redirect(302, state.path);
                }
                return;
            }
            const code = req.query.code;
            if (!code) {
                return initiateOAuth(req, res);
            }
            const state = retrieveState(req, res);
            const tokenData = await getGitHubAccessToken(code);
            const user = await getGitHubUser(tokenData);
            console.log("Login attempt:", user.login);
            let members = [];
            let page = 1;
            let isUserMember = false;
            do {
                if (Array.isArray(urls.githubOrgMembers)) {
                    urls.githubOrgMembers.forEach(async (url, index) => {
                        members = members.concat(await getGitHubOrgMemberships(page, index));
                    });
                }
                else {
                    members = await getGitHubOrgMemberships(page);
                }
                page++;
                isUserMember = members.some((member) => member.login === user.login);
            } while (!isUserMember && members.length);
            if (!members.find((member) => member.login === user.login)) {
                return res.redirect(302, urls.localMembershipError);
            }
            return succeed(res, user, state.path);
        }
        catch (error) {
            console.error(error);
            return res.redirect(302, urls.localGenericError);
        }
    });
}
exports.registerGitHubOAuth = registerGitHubOAuth;
//# sourceMappingURL=github-oauth.js.map