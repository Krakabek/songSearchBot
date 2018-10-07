export function logError(service: string, ...args: any) {
    console.error(`=> RUNTIME ERROR in ${service}`);
    console.error("==========================================================================");
    console.error(...args);
    console.error("==========================================================================");
    console.error();
}
