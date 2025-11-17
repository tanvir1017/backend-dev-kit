import { TCountryCode } from "countries-list";

export function getFlagEmoji(countryCode: TCountryCode) {
  const code = countryCode.toUpperCase();

  const OFFSET = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    ...[...code].map((c) => c.charCodeAt(0) + OFFSET),
  );
}
