import * as base64 from "base-64";
import * as Bluebird from "bluebird";
import * as request from "request-promise";
import * as utf8 from "utf8";
import {config} from "../config";
import {Dictionary} from "../dictionary";
import {formatQuery} from "../query-formatter";

let token = "";

interface SpotifyResponse {
    tracks: {
        items: Array<{
            external_urls: {
                spotify: string
            }
        }>,
        total: number
    }
}

interface SpotifyAuthResponse {
    "access_token": string;
    "token_type": string;
    "expires_in": number;
}


function getAuth(): Bluebird<boolean> {
    // <base64 encoded client_id:client_secret>
    const keys = `${config.spotify.clientId}:${config.spotify.clientSecret}`;
    const encodedKeys = base64.encode(utf8.encode(keys));
    return request({
        method: "POST",
        uri: "https://accounts.spotify.com/api/token",
        form: {
            grant_type: "client_credentials"
        },
        headers: {
            "Authorization": `Basic ${encodedKeys}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        json: true
    }).then((response: SpotifyAuthResponse) => {
        token = response.access_token;
        const reAuthDelay = response.expires_in - 60;
        setTimeout(() => {
            token = "";
        }, reAuthDelay * 1000);
        return true;
    }).catch((err) => {
        return false;
    });
}

export function SearchSpotify(songname: string): Bluebird<string> {
    if (!token) {
        return getAuth().then((res) => {
            if (res) {
                return SearchSpotify(songname);
            } else {
                return `Spotify: ${Dictionary.request_error}`;
            }
        });
    }
    const formattedName = formatQuery(songname);
    const requestUrl = `https://api.spotify.com/v1/search?q=${formattedName}&type=track&limit=1`;
    return request.get(requestUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((res: string) => {
            try {
                const parsedRes = JSON.parse(res) as SpotifyResponse;
                if (parsedRes.tracks.total) {
                    return parsedRes.tracks.items[0].external_urls.spotify;
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
            return `Spotify: ${result}`;
        });
}
