import * as Bluebird from "bluebird";
import {ProviderResponse} from "./interfaces";
import {formatResponse} from "../formatter";

export function SearchYoutube(songname: string):  Bluebird<ProviderResponse> {
    return Bluebird.resolve()
        .then(() => {
            const youtubeSearchLink = `
                https://www.youtube.com/results?
                search_query=${encodeURI(songname)}
                &page=&utm_source=opensearch
            `.replace(/[\n\s]/g, "");
            console.dir(youtubeSearchLink);
            return {
                url: formatResponse("YouTube", youtubeSearchLink),
                albumCover: ""
            };
        });
}
