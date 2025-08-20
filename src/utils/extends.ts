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
  return console.log(message, ...optionalParams);
};

console.debugTable = function (message?: any, ...optionalParams: any[]) {
  if (NODE_ENV === "production") return;
  return console.table(message, ...optionalParams);
};
