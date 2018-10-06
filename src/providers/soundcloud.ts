import {ProviderResponse} from "./interfaces";
import {formatQuery, formatResponse} from "../formatter";

function makeSearchLink(query: string): string {
    return `https://soundcloud.com/search/sounds?q=${formatQuery(query)}
            `.replace(/[\n\s]/g, "");
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
