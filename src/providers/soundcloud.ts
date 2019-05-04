import {ProviderResponse} from "./interfaces";
import {makeProviderResponse} from "../core/response";
import * as qs from "qs";

function makeSearchLink(query: string): string {
    const url = "https://soundcloud.com/search/sounds";
    const params = qs.stringify({
        q: query,
    });

    return `${url}?${params}`;
}

export function SearchSoundCloud(songName: string): Promise<ProviderResponse> {
    return Promise.resolve(
        makeProviderResponse("SoundCloud", makeSearchLink(songName))
    );
}
