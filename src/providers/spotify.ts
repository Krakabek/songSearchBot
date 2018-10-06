import * as base64 from "base-64";
import * as config from "config";
import * as request from "request-promise";
import * as utf8 from "utf8";
import {Dictionary} from "../dictionary";
import {formatQuery, formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";

let token = "";

interface SpotifyResponse {
    tracks: {
        items: Array<{
            external_urls: {
                spotify: string
            },
            album: {
                images: Array<{ url: string }>
            }
        }>,
        total: number
    };
}

interface SpotifyAuthResponse {
    "access_token": string;
    "token_type": string;
    "expires_in": number;
}

function getAuth(): Promise<boolean> {
    // <base64 encoded client_id:client_secret>
    const keys = `${config.get("spotify.clientId")}:${config.get("spotify.clientSecret")}`;
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
        const oneMinute = 60;
        const msInMin = 1000;
        const reAuthDelay = response.expires_in - oneMinute;
        setTimeout(() => {
            token = "";
        }, reAuthDelay * msInMin);
        return true;
    }).catch((err) => {
        return false;
    });
}

export function SearchSpotify(songname: string): Promise<ProviderResponse> {
    if (!token) {
        return getAuth().then((res) => {
            if (res) {
                return SearchSpotify(songname);
            } else {
                return {
                    url: `Spotify: ${Dictionary.request_error}`,
                    albumCover: artwork
                };
            }
        });
    }
    const formattedName = formatQuery(songname);
    const requestUrl = `https://api.spotify.com/v1/search?q=${formattedName}&type=track&limit=1`;
    let artwork = "";
    return request.get(requestUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((res: string) => {
            try {
                const parsedRes = JSON.parse(res) as SpotifyResponse;
                if (parsedRes.tracks.total) {
                    if (parsedRes.tracks.items[0].album.images[0]) {
                        artwork = parsedRes.tracks.items[0].album.images[0].url;
                    }
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
            return {
                url: formatResponse("Spotify", result),
                albumCover: artwork
            };
        });
}
