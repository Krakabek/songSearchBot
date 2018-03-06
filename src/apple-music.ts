import * as request from "request-promise";
import {Dictionary} from "./dictionary";

export function SearchAMusic(songname: string): Promise<string> {
    const formattedName = songname.replace(" ", "+");
    const requestUrl = `https://itunes.apple.com/search?term=${formattedName}&country=ua`;
    return request.get(requestUrl)
        .then((res: Array<any>) => {
            if (res.length) {
                return res[0].trackViewUrl;
            } else {
                return Dictionary.no_result;
            }
        })
        .catch(() => {
            return Dictionary.request_error;
        })
        .then((result) => {
            return `Apple Music: ${result}`;
        });

}
