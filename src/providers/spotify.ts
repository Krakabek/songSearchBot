import * as base64 from "base-64";
import * as config from "config";
import * as utf8 from "utf8";
import {Dictionary} from "../dictionary";
import {formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";
import Axios from "axios";
import * as querystring from "querystring";

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

const spotifyAccountApi = Axios.create({
    baseURL: "https://accounts.spotify.com/api",

});

const spotifyApi = Axios.create({
    baseURL: "https://api.spotify.com/v1",
});

function getAuth(): Promise<boolean> {
    // <base64 encoded client_id:client_secret>
    const keys = `${config.get("spotify.clientId")}:${config.get("spotify.clientSecret")}`;
    const encodedKeys = base64.encode(utf8.encode(keys));

    const requestParams = querystring.stringify({
        grant_type: "client_credentials"
    });

    const autenthicate = spotifyAccountApi.post<SpotifyAuthResponse>("token", requestParams, {
        headers: {
            "Authorization": `Basic ${encodedKeys}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return autenthicate.then((response) => {
        token = response.data.access_token;
        const oneMinute = 60;
        const msInMin = 1000;
        const reAuthDelay = response.data.expires_in - oneMinute;
        setTimeout(() => {
            token = "";
        }, reAuthDelay * msInMin);
        return true;
    }).catch((err) => {
        return false;
    });
}

export function SearchSpotify(songName: string): Promise<ProviderResponse> {
    if (!token) {
        return getAuth().then((res) => {
            if (res) {
                return SearchSpotify(songName);
            } else {
                return {
                    url: `Spotify: ${Dictionary.request_error}`,
                    albumCover: artwork
                };
            }
        });
    }

    let artwork = "";

    const searchTrack = spotifyApi.get<SpotifyResponse>("search", {
        params: {
            q: songName,
            type: "track",
            limit: 1,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    return searchTrack.then((response) => {
        const parsedResponse = response.data;

        if (parsedResponse.tracks.total) {
            if (parsedResponse.tracks.items[0].album.images[0]) {
                artwork = parsedResponse.tracks.items[0].album.images[0].url;
            }
            return parsedResponse.tracks.items[0].external_urls.spotify;
        } else {
            return Dictionary.no_result;
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
