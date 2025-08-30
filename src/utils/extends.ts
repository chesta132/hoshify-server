import { NODE_ENV } from "../app";

JSON.isJSON = function (item: any) {
  try {
    JSON.parse(item);
    return true;
  } catch {
    return false;
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

console.debug = function (message?: any, ...optionalParams: any[]) {
  if (NODE_ENV === "production") return;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];
  console.log("Called by: ", callerLine);
  return this.log(message, ...optionalParams);
};

console.debugTable = function (message?: any, ...optionalParams: any[]) {
  if (NODE_ENV === "production") return;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2];
  this.log("Called by: ", callerLine);
  return this.table(message, ...optionalParams);
};

Object.isObject = function <T>(object: T) {
  if (typeof object === "object" && object !== null && !(object instanceof Date)) return true;
  return false;
};
