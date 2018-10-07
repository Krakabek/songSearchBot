import {ProviderResponse} from "./interfaces";
import {formatResponse} from "../formatter";
import * as qs from "qs";

function makeSearchLink(query: string): string {
    const url = "https://soundcloud.com/search/sounds";
    const params = qs.stringify({
        q: query,
    });

    return `${url}?${params}`;
}

export function SearchSoundCloud(songName: string):  Promise<ProviderResponse> {
    return Promise.resolve()
        .then(() => {
            return {
                url: formatResponse("SoundCloud", makeSearchLink(songName)),
                albumCover: ""
            };
        });
}
