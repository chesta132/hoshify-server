export const { NODE_ENV, HOSHIFY_ICON, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;
export const CLIENT_URL = NODE_ENV === "development" ? process.env.CLIENT_URL_DEV : process.env.CLIENT_URL;
