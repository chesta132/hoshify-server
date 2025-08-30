import { isValidObjectId } from "mongoose";
import { Response } from "express";
import { spacing } from "./manipulate";

export const validateIds = (ids: string[], res: Response["res"]) => {
  if (!Array.isArray(ids)) {
    res.tempClientType("invalid body type. Array only").respond();
    return false;
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
    res.tempClientType("Object ID", `${invalidIds.join(", ")} is not ObjectId.`).respond();
    return false;
  }
  return true;
};

export const validateRequires = (neededField: string[], from: any, res: Response["res"]) => {
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
    res.tempMissingFields(missingFields.join(", ")).respond();
    return false;
  }
  return true;
};
