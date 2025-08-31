import { Document, Model, Query } from "mongoose";
import { normalizeCurrency, normalizeQuery, normalizeUserQuery } from "../manipulate/normalize";

Document.prototype.normalize = function () {
  return normalizeQuery(this);
};

Document.prototype.normalizeUser = function () {
  return normalizeUserQuery(this);
};

Document.prototype.normalizeCurrency = function (currency) {
  return normalizeCurrency(this as any, currency);
};

Query.prototype.normalize = async function () {
  const query = await this.exec();
  if (!query) return null;
  return normalizeQuery(query);
};

Query.prototype.normalizeUser = async function () {
  const query = await this.exec();
  if (!query) return null;
  return normalizeUserQuery(query);
};

Query.prototype.normalizeCurrency = async function (currency) {
  const query = await this.exec();
  if (!query) return null;
  return normalizeCurrency(query, currency);
};
