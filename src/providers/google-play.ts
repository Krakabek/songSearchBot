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

export function SearchGMusic(songname: string): Bluebird<ProviderResponse> {
    const formattedName = formatQuery(songname);
    const requestUrl = getStoreUrl(`/store/search?c=music&q=${formattedName}`);

    return request.get(requestUrl)
        .then((result: string) => {
            if (result.indexOf("We couldn't find anything for your search") !== -1) {
                return Dictionary.no_result;
            }

            const musicLink = /href="(\/store\/music\/collection\/5:search_cluster:4.*?)"/ig;
            const matches = musicLink.exec(result);

            if (!matches) {
                return Dictionary.parsing_error;
            }

            return request.post(getStoreUrl(matches[1]))
                .then((musicResult: string) => {
                    const $ = cheerio.load(musicResult);
                    const firstSongHref = $(".card-list .card .card-click-target").attr("href");

                    if (!firstSongHref) {
                        return Dictionary.no_result;
                    }

                    return getStoreUrl(firstSongHref);
                });
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
