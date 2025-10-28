export default function joinPath(...parts: string[]): string {
  let baseUrl: URL | undefined;

  parts.forEach((part) => {
    try {
      if (!baseUrl) {
        baseUrl = new URL(part);
      } else if (part.startsWith("../")) {
        const cleanPart = part.replace(/^\.\.\//, "");
        baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/${cleanPart}`;
      } else {
        const newUrl = new URL(part, baseUrl.toString());
        baseUrl = newUrl;
      }
    } catch (error) {
      if (baseUrl) {
        const cleanPart = part.replace(/^\/+|\/+$/g, "");
        baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/${cleanPart}`;
      }
    }
  });

  return baseUrl ? baseUrl.toString() : "";
}
