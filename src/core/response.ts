import {ProviderResponse} from "../providers/interfaces";

export function formatResponse(service: string, response: string): string {
    return response.indexOf("http") !== -1
        ? `[${service}](${response})`
        : `${service}: ${response}`;
}

export function makeProviderResponse(providerName: string, result: string, albumCover = ""): ProviderResponse {
    return {
        url: formatResponse(providerName, result),
        albumCover,
    };
}

export function createProviderResponder(providerName: string) {
    return (result: string, albumCover?: string): ProviderResponse => {
        return makeProviderResponse(providerName, result, albumCover);
    };
}
