import {ProviderResponse} from "./interfaces";
import {formatResponse} from "../formatter";
import * as qs from "qs";

function makeSearchLink(query: string): string {
    const url = "https://www.youtube.com/results";
    const params = qs.stringify({
        search_query: query,
        page: "",
        utm_source: "opensearch"
    });

    return `${url}?${params}`;
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
