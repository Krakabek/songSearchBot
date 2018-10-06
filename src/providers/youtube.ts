import {ProviderResponse} from "./interfaces";
import {formatQuery, formatResponse} from "../formatter";

function makeSearchLink(query: string): string {
    const url = "https://www.youtube.com/results";
    const params = [
        `search_query=${formatQuery(query)}`,
        "page=",
        "utm_source=opensearch",
    ];
    const fullUrl = url + "?" + params.join("&");

    return fullUrl.replace(/[\n\s]/g, "");
}

export function SearchYoutube(songName: string): Promise<ProviderResponse> {
    return Promise.resolve()
        .then(() => {
            return {
                url: formatResponse("YouTube", makeSearchLink(songName)),
                albumCover: ""
            };
        });
}
