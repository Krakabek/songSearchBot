export function formatQuery(query: string): string {
    return encodeURI(query.replace(/\s/mg, "+"));
}

export function formatResponse(service: string, response: string): string {
    return response.indexOf("http") !== -1
        ? `[${service}](${response})`
        : `${service}: ${response}`;
}
