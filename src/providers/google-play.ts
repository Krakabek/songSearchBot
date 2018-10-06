import * as cheerio from "cheerio";
import {Dictionary} from "../dictionary";
import {formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";
import Axios from "axios";

const baseURL = "https://play.google.com";
const googlePlay = Axios.create({baseURL});

function getShareUrl(songId: string, songName: string, artistName: string): string {
    const tParam = `${songName} - ${artistName}`;
    const tParamEncoded = tParam
        .replace(/\s/g, "+")
        .replace(/[()]/g, "+");

    return `${baseURL}/music/m/${songId}?t=${tParamEncoded}`;
}

export function SearchGMusic(songName: string): Promise<ProviderResponse> {
    const searchTrack = googlePlay.get("/store/search", {
        params: {
            c: "music",
            q: songName,
        },
    });

    return searchTrack
        .then((result) => {
            const searchResult = result.data;
            if (searchResult.indexOf("We couldn't find anything for your search") !== -1) {
                return Dictionary.no_result;
            }

            const $ = cheerio.load(searchResult);
            const songDiv = $(`.card[data-docid^="song-"]`).first();
            const songDocIdValue = songDiv.attr("data-docid");
            const songNameValue = songDiv.find(".title").first().attr("title");
            const artistNameValue = songDiv.find(".subtitle").first().attr("title");

            if (!songDocIdValue) {
                return Dictionary.parsing_error;
            }

            const prefixIndex = 5;
            const songId = songDocIdValue.slice(prefixIndex);

            return getShareUrl(songId, songNameValue, artistNameValue);
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
