import pluralize from "pluralize";
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

String.prototype.capitalEach = function (start?: string | number, end?: string | number) {
  let firstUn = "";
  let lastUn = "";

  switch (typeof start) {
    case "string":
      firstUn = this.slice(0, this.indexOf(start));
      break;
    case "number":
      firstUn = this.slice(0, start);
      break;
  }

  switch (typeof end) {
    case "string":
      lastUn = this.slice(this.indexOf(end));
      break;
    case "number":
      lastUn = this.slice(end);
      break;
  }

  const capitalized = this.slice(firstUn.length, this.length - lastUn.length)
    .split(" ")
    .map((letter) => letter[0] && letter[0].toUpperCase() + letter.slice(1));

  const resultString = firstUn + capitalized.join(" ") + lastUn;
  return resultString;
};

String.prototype.capital = function (scissors?: string | number) {
  let scissorsIndex: number | undefined;
  if (typeof scissors === "string") {
    const indexof = this.indexOf(scissors);
    if (indexof !== -1) scissorsIndex = indexof;
  } else if (typeof scissors === "number") scissorsIndex = scissors;

  const sliceString = this.slice(scissorsIndex ?? 0);
  const sliceStringEarly = this.slice(0, scissorsIndex ?? 0);
  const restOfWord = this.slice(scissorsIndex ? scissorsIndex + 1 : 1);

  const firstLetter = sliceString.charAt(0).toUpperCase();

  const resultString = sliceStringEarly + firstLetter + restOfWord;

  return resultString;
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

Date.prototype.toFormattedString = function (optionsProp = { includeThisYear: true, includeHour: false }) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const hourOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  try {
    if (this.toString() === "Invalid Date") {
      return "Invalid Date";
    }
    const { includeHour, includeThisYear } = optionsProp;
    const formatter = new Intl.DateTimeFormat("en-US", includeHour ? { ...options, ...hourOptions } : options);
    const formattedDate = formatter.format(this);
    const thisYear = new Date().getFullYear().toString();

    if (formattedDate.includes(thisYear) && !includeThisYear) {
      const splittedDate = formattedDate.split(", " + thisYear);
      return splittedDate.join("");
    }

    return formattedDate;
  } catch (error) {
    console.error(error);
    return "Invalid Date";
  }
};

Array.prototype.plural = function (baseWord) {
  return pluralize(baseWord, this.length || 1);
};

String.prototype.plural = function (items?: any[]): string {
  return pluralize(this.toString(), items?.length || 1);
};

String.prototype.ellipsis = function (max) {
  if (max <= 0) return "";
  if (this.length <= max) return this.toString();
  if (max <= 3) return this.slice(0, max);
  return this.slice(0, max - 3) + "...";
};
