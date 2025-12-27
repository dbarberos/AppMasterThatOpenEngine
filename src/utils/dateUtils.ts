export function parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    if (parts.length !== 3) {
        throw new Error('Invalid date format. Expected dd/mm/yyyy');
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    return date;
}


// Helper para formatear fecha a string
export function formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date object');
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}