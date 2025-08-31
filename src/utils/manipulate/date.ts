type FormatDateOptions = { includeThisYear?: boolean; includeHour?: boolean };
/**
 * Returns a string representation of a date. The format of the string is en-US locale.
 *
 * @param date - Original date
 * @param options - Options for date format
 * @returns Formatted date in type of string
 */
export const formatDate = (date: Date, options: FormatDateOptions = { includeThisYear: true }) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const hourOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  try {
    if (date.toString() === "Invalid Date") {
      return "Invalid Date";
    }
    const { includeHour, includeThisYear } = options;
    const formatter = new Intl.DateTimeFormat("en-US", includeHour ? { ...formatOptions, ...hourOptions } : formatOptions);
    const formattedDate = formatter.format(date);
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
