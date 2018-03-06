import * as request from "request-promise";
import {Dictionary} from "./dictionary";
import Bluebird = require("bluebird");

interface ItunesResponse {
    resultCount: number;
    results: Array<any>;
};

export function SearchAMusic(songname: string): Bluebird<string> {
    const formattedName = songname.replace(/\s/mg, "+");
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
            return `Apple Music: ${result}`;
        });

}
