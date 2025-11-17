import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";

class CurrencyConverter {
  /**
   * Convert dollars to cents with validation
   */
  static toCents(dollars: number): number {
    if (typeof dollars !== "number" || isNaN(dollars)) {
      throw new AppError(
        HttpStatusCode.NotAcceptable,
        "Invalid dollars amount: must be a number",
      );
    }

    if (dollars < 0) return 0;

    // Round to avoid floating point precision issues
    return Math.round(dollars * 100);
  }

  /**
   * Convert cents to dollars with validation
   */
  static toDollars(cents: number): number {
    if (typeof cents !== "number" || isNaN(cents)) {
      throw new AppError(
        HttpStatusCode.NotAcceptable,
        "Invalid cents amount: must be a number",
      );
    }

    if (cents < 0) return 0;

    // Round to 2 decimal places to avoid floating point issues
    return Math.round((cents / 100) * 100) / 100;
  }

  /**
   * Format cents as currency string
   */
  static format(cents: number, currency: string = "USD"): string {
    const dollars = this.toDollars(cents);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(dollars);
  }

  /**
   * Safe conversion that returns 0 instead of throwing errors
   */
  static safeToCents(dollars: unknown): number {
    try {
      if (typeof dollars === "number") {
        return this.toCents(dollars);
      }
      // Try to convert string to number
      const parsed = parseFloat(dollars as string);
      if (!isNaN(parsed)) {
        return this.toCents(parsed);
      }
      return 0;
    } catch {
      return 0;
    }
  }
}
export default CurrencyConverter;
