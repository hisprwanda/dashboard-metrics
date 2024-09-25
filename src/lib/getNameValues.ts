export default function getNameValues(name: string): string {
    const words: string[] = name
        .split(' ')
        .filter((word: string) => word.length > 0);

    if (words.length === 0) {
        return '';
    }

    const firstInitial: string = words[0][0].toUpperCase();

    if (words.length === 1) {
        return firstInitial;
    }

    const secondInitial: string = words[1][0].toUpperCase();

    return firstInitial + secondInitial;
}