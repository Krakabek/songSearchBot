import * as request from "request-promise";
import * as Bluebird from "bluebird";
import {Dictionary} from "../dictionary";
import {formatQuery, formatResponse} from "../formatter";

interface ItunesResponse {
    resultCount: number;
    results: Array<any>;
}

export function SearchAMusic(songname: string): Bluebird<string> {
    const formattedName = formatQuery(songname);
    const requestUrl = `https://itunes.apple.com/search?term=${formattedName}&country=ua`;
    return request.get(requestUrl)
        .then((res: string) => {
            try {
                const parsedRes = JSON.parse(res) as ItunesResponse;
                if (parsedRes.resultCount) {
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
            return formatResponse("Apple Music", result);
        });

}
