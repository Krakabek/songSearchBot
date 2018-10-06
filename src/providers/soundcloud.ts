import * as Bluebird from "bluebird";
import {ProviderResponse} from "./interfaces";
import {formatQuery, formatResponse} from "../formatter";

export function SearchSoundCloud(songname: string):  Bluebird<ProviderResponse> {
    return Bluebird.resolve()
        .then(() => {
            const soundCloudSearchLink = `
                https://soundcloud.com/search/sounds?
                q=${formatQuery(songname)}
            `.replace(/[\n\s]/g, "");
            return {
                url: formatResponse("SoundCloud", soundCloudSearchLink),
                albumCover: ""
            };
        });
}
