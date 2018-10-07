import {ProviderResponse} from "./interfaces";
import {makeProviderResponse} from "../core/response";
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
    return Promise.resolve(
        makeProviderResponse("YouTube", makeSearchLink(songName))
    );
}
