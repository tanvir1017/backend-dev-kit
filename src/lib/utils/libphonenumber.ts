import { HttpStatusCode } from "axios";
import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import AppError from "../../app/errors/appError";

const validatePhoneNumber = (phone: string, country: CountryCode = "US") => {
  const parsed = parsePhoneNumberFromString(phone, country);

  if (!parsed) {
    return { isValid: false, error: "Cannot parse number" };
  }

  if (!parsed.isValid()) {
    throw new AppError(HttpStatusCode.BadRequest, "Invalid phone number");
  }

  return {
    isValid: true,
    formatted: parsed.formatInternational(),
    country: parsed.country,
    type: parsed.getType(), // MOBILE, FIXED_LINE, etc.
    possible: parsed.isPossible(),
  };

  /* {
  "isValid": true,
  "formatted": "+1 555-123-4567",
  "country": "US",
  "type": "FIXED_LINE_OR_MOBILE",
  "possible": true
} */
};

const isValidPhone = (phone: string): boolean => {
  try {
    const parsed = parsePhoneNumberFromString(phone, "US");
    return parsed ? parsed.isValid() : false;
  } catch {
    return false;
  }
};

export { isValidPhone, validatePhoneNumber };
