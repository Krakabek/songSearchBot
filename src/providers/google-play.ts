import * as cheerio from "cheerio";
import {Dictionary} from "../core/dictionary";
import {createProviderResponder} from "../core/response";
import {ProviderResponse} from "./interfaces";
import Axios from "axios";
import {logError} from "../core/logger";

const baseURL = "https://play.google.com";
const googlePlay = Axios.create({baseURL});
const makeResponse = createProviderResponder("Google Play Music");

function getShareUrl(songId: string, songName: string, artistName: string): string {
    const tParam = `${songName} - ${artistName}`;
    const tParamEncoded = tParam
        .replace(/\s/g, "+")
        .replace(/[()]/g, "+");

    return `${baseURL}/music/m/${songId}?t=${tParamEncoded}`;
}

export async function SearchGMusic(songName: string): Promise<ProviderResponse> {
    try {
        const tracks = await googlePlay.get("/store/search", {
            params: {
                c: "music",
                q: songName,
            },
        });

        const searchResult = tracks.data;
        if (searchResult.indexOf("We couldn't find anything for your search") !== -1) {
            return makeResponse(Dictionary.no_result);
        }

        const $ = cheerio.load(searchResult);
        const songDiv = $(`.card[data-docid^="song-"]`).first();
        const songDocIdValue = songDiv.attr("data-docid");
        const songNameValue = songDiv.find(".title").first().attr("title");
        const artistNameValue = songDiv.find(".subtitle").first().attr("title");

        if (!songDocIdValue) {
            return makeResponse(Dictionary.parsing_error);
        }

        const prefixIndex = 5;
        const songId = songDocIdValue.slice(prefixIndex);

        return makeResponse(getShareUrl(songId, songNameValue, artistNameValue));
    } catch (e) {
        logError("Google Play Music", e);
        return makeResponse(Dictionary.request_error);
    }
}
