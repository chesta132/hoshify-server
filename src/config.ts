export const { HOSHIFY_ICON, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;
export const NODE_ENV = (process.env.NODE_ENV || "development") as "development" | "production";
export const CLIENT_URL = NODE_ENV === "development" ? process.env.CLIENT_URL_DEV : process.env.CLIENT_URL;
export const PAGINATION_LIMIT = NODE_ENV === "development" ? 100 : 30;
