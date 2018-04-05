import * as Bluebird from "bluebird";
import * as cheerio from "cheerio";
import * as request from "request-promise";
import {Dictionary} from "../dictionary";
import {formatQuery, formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";

const baseUrl = "https://play.google.com";

function getStoreUrl(part: string): string {
    return `${baseUrl}${part}`;
}

function getShareUrl(songId: string, songName: string, artistName: string): string {
    const tParam = `${songName} - ${artistName}`;
    const tParamEncoded = tParam
        .replace(/\s/g, "+")
        .replace(/[()]/g, "+");

    return `${baseUrl}/music/m/${songId}?t=${tParamEncoded}`;
}

export function SearchGMusic(songname: string): Bluebird<ProviderResponse> {
    const formattedName = formatQuery(songname);
    const requestUrl = getStoreUrl(`/store/search?c=music&q=${formattedName}`);

    return request.get(requestUrl)
        .then((searchResult: string) => {
            if (searchResult.indexOf("We couldn't find anything for your search") !== -1) {
                return Dictionary.no_result;
            }

            const $ = cheerio.load(searchResult);
            const songDiv = $(`.card[data-docid^="song-"]`).first();
            const songDocId = songDiv.attr("data-docid");
            const songName = songDiv.find(".title").first().attr("title");
            const artistName = songDiv.find(".subtitle").first().attr("title");

            if (!songDocId) {
                return Dictionary.parsing_error;
            }

            const prefixIndex = 5;
            const songId = songDocId.slice(prefixIndex);

            return getShareUrl(songId, songName, artistName);
        })
        .catch(() => {
            return Dictionary.request_error;
        })
        .then((result) => {
            return {
                url: formatResponse("Google Play Music", result),
                albumCover: ""
            };
        });
}
