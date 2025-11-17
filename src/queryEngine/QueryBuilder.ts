export function buildSearchOR<T>(
  fields: (keyof T)[],
  q: string,
): Record<string, any>[] {
  return fields.map((field) => ({
    [field]: { contains: q, mode: "insensitive" },
  }));
}
class QueryEngine {}

export default QueryEngine;
