declare module "date-fns-tz" {
  import type { Locale } from "date-fns";

  /**
   * Convert the provided date into a new Date instance in the target time zone.
   * Accepts ISO strings, numbers, or Date instances.
   */
  export function toDate(argument: string | number | Date, options?: { timeZone?: string }): Date;

  /**
   * Format the provided date using the supplied time zone and date-fns tokens.
   */
  export function formatInTimeZone(
    date: string | number | Date,
    timeZone: string,
    formatString: string,
    options?: { locale?: Locale }
  ): string;
}
