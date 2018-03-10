export function formatQuery(query: string): string{
    return encodeURI(query.replace(/\s/mg, "+"));
}
