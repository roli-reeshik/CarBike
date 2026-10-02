/** Indian mobile numbers: 10 digits starting 6–9, with an optional 0 or 91 prefix. */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;

  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return local;
}
