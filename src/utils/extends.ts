import { NODE_ENV } from "@/config";

JSON.isJSON = function (text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

JSON.safeParse = function <T>(text?: string, fallback?: T) {
  try {
    return this.parse(text || "invalid");
  } catch {
    return fallback;
  }
};

Object.compare = function <T extends object>(...objectsProp: T[]) {
  const objects = [...objectsProp];
  let longestObjectKeys = 0;
  let longestObjectKeysIndex = 0;

  objects.forEach((object, index) => {
    const length = Object.entries(object).length;
    if (longestObjectKeys < length) {
      longestObjectKeys = length;
      longestObjectKeysIndex = index;
    }
  });
  const [longestObject] = objects.splice(longestObjectKeysIndex, 1);

  return Object.entries(longestObject).every(([key, value]) => {
    return objects.every((object) => Object.getOwnPropertyNames(object).includes(key) && object[key as keyof T] === value);
  });
};

console.debug = function (message?: "NO_TRACE" | (string & {}), ...data: any[]) {
  if (NODE_ENV === "production") return;
  const noTrace = message === "NO_TRACE";

  if (noTrace) {
    this.groupCollapsed(...data);
  } else {
    this.groupCollapsed(message, ...data);
  }

  if (!noTrace) {
    this.trace();
  }

  console.groupEnd();
};

console.debugTable = function (tabularData, properties, trace) {
  if (NODE_ENV === "production") return;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2].trim().slice(2);
  const noTrace = trace === "NO_TRACE";
  const superTrace = trace === "SUPER_TRACE";

  if (!noTrace) this.log("Called by: " + callerLine);
  else if (superTrace) this.trace();

  this.table(tabularData, properties);
};

Object.isObject = function <T>(object: T) {
  if (typeof object === "object" && object !== null && !(object instanceof Date)) return true;
  return false;
};

Object.typedEntries = function <T extends object>(object: T) {
  return this.entries(object) as [keyof T, T[keyof T]][];
};

Object.typedKeys = function <T extends object>(object: T) {
  return this.keys(object) as (keyof T)[];
};

Object.typedValues = function <T extends object>(object: T) {
  return this.values(object) as T[keyof T][];
};
