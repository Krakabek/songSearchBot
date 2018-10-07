import * as base64 from "base-64";
import * as config from "config";
import * as utf8 from "utf8";
import {Dictionary} from "../core/dictionary";
import {ProviderResponse} from "./interfaces";
import Axios from "axios";
import * as querystring from "querystring";
import {logError} from "../core/logger";
import {createProviderResponder} from "../core/response";

let authToken = "";

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

const makeResponse = createProviderResponder("Spotify");

async function autenthicate(): Promise<boolean> {
    // <base64 encoded client_id:client_secret>
    const keys = `${config.get("spotify.clientId")}:${config.get("spotify.clientSecret")}`;
    const encodedKeys = base64.encode(utf8.encode(keys));

    const requestParams = querystring.stringify({
        grant_type: "client_credentials"
    });

    try {
        const authResult = await spotifyAccountApi.post<SpotifyAuthResponse>("token", requestParams, {
            headers: {
                "Authorization": `Basic ${encodedKeys}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        authToken = authResult.data.access_token;
        const oneMinute = 60;
        const msInMin = 1000;
        const reAuthDelay = authResult.data.expires_in - oneMinute;
        setTimeout(() => {
            authToken = "";
        }, reAuthDelay * msInMin);
        return true;
    } catch (e) {
        logError("Spotify Auth", e);
        return false;
    }
}

export async function SearchSpotify(songName: string): Promise<ProviderResponse> {
    if (!authToken) {
        if (await autenthicate()) {
            return SearchSpotify(songName);
        } else {
            return makeResponse(Dictionary.request_error);
        }
    }

    try {
        const tracksResponse = await spotifyApi.get<SpotifyResponse>("search", {
            params: {
                q: songName,
                type: "track",
                limit: 1,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            }
        });

        const tracks = tracksResponse.data.tracks;

        if (tracks.total) {
            const artwork = tracks.items[0].album.images[0]
                ? tracks.items[0].album.images[0].url
                : "";
            const url = tracks.items[0].external_urls.spotify;

            return makeResponse(url, artwork);
        } else {
            return makeResponse(Dictionary.no_result);
        }
    } catch (e) {
        logError("Spotify", e);
        return makeResponse(Dictionary.request_error);
    }
}
