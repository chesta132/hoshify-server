import { isValidObjectId } from "mongoose";
import { Response } from "express";
import { spacing } from "./manipulate/string";
import { ErrorTemplate } from "@/class/ErrorTemplate";

export const validateIds = (ids: string[]) => {
  if (!Array.isArray(ids)) {
    throw new ErrorTemplate({ code: "CLIENT_TYPE", field: "body", details: "Array only." });
  }
  let invalidIds: string[] = [];

  const isObjectId = ids?.every((id) => {
    if (isValidObjectId(id)) return true;
    else {
      invalidIds.push(id);
      return false;
    }
  });

  if (!isObjectId) {
    throw new ErrorTemplate({ code: "CLIENT_TYPE", field: "Object ID", details: `${invalidIds.join(", ")} is not ObjectId.` });
  }
};

export const validateRequires = (neededField: string[], from: any) => {
  const missingFieldsSet: Set<string> = new Set();
  let isValid = true;
  if (Array.isArray(from)) {
    from.forEach((data) => {
      neededField.forEach((field) => {
        if (data[field] === undefined) {
          missingFieldsSet.add(field);
          isValid = false;
        }
      });
    });
  } else {
    neededField.forEach((field) => {
      if (from[field] === undefined) {
        missingFieldsSet.add(field);
        isValid = false;
      }
    });
  }
  const missingFields = [...missingFieldsSet].map((field) => spacing(field));

  if (!isValid) {
    throw new ErrorTemplate({ code: "MISSING_FIELDS", fields: missingFields.join(", ") });
  }
};
