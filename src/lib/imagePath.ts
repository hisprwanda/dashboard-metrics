export default function formatImagePath(path: string): string {
    const cleanedPath = path.replace(/^(\.\.\/)+/, '');
    return cleanedPath.startsWith('/') ? cleanedPath : '/' + cleanedPath;
}