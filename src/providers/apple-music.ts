import * as request from "request-promise";
import {Dictionary} from "../dictionary";
import {formatQuery, formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";

interface ItunesResponse {
    resultCount: number;
    results: Array<any>;
}

export function SearchAMusic(songname: string): Promise<ProviderResponse> {
    const formattedName = formatQuery(songname);
    const requestUrl = `https://itunes.apple.com/search?term=${formattedName}&country=ua`;
    let artwork = "";
    return request.get(requestUrl)
        .then((res: string) => {
            try {
                const parsedRes = JSON.parse(res) as ItunesResponse;
                if (parsedRes.resultCount) {
                    artwork = parsedRes.results[0].artworkUrl100;
                    return parsedRes.results[0].trackViewUrl;
                } else {
                    return Dictionary.no_result;
                }
            } catch (e) {
                return Dictionary.parsing_error;
            }
        })
        .catch(() => {
            return Dictionary.request_error;
        })
        .then((result) => {
            return {
                url: formatResponse("Apple Music", result),
                albumCover: artwork
            };
        });

}
