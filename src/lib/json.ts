export function safeParseJsonObject(json: string) {
  try {
    const object = JSON.parse(json) as Record<string, unknown>;
    if (
      typeof object !== "object" ||
      object === null ||
      Array.isArray(object)
    ) {
      return null;
    }
    return object;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}
export function safeParseJsonArray(json: string) {
  try {
    const array = JSON.parse(json) as unknown[];
    if (!Array.isArray(array)) {
      return null;
    }
    return array;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}
