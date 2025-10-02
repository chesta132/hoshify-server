import { spacing } from "./manipulate/string";
import { AppError } from "@/services/error/AppError";

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
    throw new AppError("MISSING_FIELDS", { fields: missingFields.join(", ") });
  }
};
