import {Dictionary} from "../dictionary";
import {formatResponse} from "../formatter";
import {ProviderResponse} from "./interfaces";
import Axios from "axios";

interface ResultsEntry {
    wrapperType: string;
    kind: string;
    artistId: string;
    collectionId: number;
    trackId: number;
    artistName: string;
    collectionName: string;
    trackName: string;
    collectionCensoredName: string;
    trackCensoredName: string;
    artistViewUrl: string;
    collectionViewUrl: string;
    trackViewUrl: string;
    previewUrl: string;
    artworkUrl30: string;
    artworkUrl60: string;
    artworkUrl100: string;
    collectionPrice: number;
    trackPrice: number;
    releaseDate: string;
    collectionExplicitness: string;
    trackExplicitness: string;
    discCount: number;
    discNumber: number;
    trackCount: number;
    trackNumber: number;
    trackTimeMillis: number;
    country: string;
    currency: string;
    primaryGenreName: string;
    isStreamable: boolean;
    collectionArtistId?: string | null;
    collectionArtistName?: string | null;
    collectionArtistViewUrl?: string | null;
}

interface ItunesResponse {
    resultCount: number;
    results: Array<ResultsEntry>;
}

function getFilterOutLivePredicate(query: string): (entry: ResultsEntry) => boolean {
    // Matches '(Live)' and 'live', but not 'alive' or 'lives'
    const liveRegularExpression = /([^\w+\-]live(?:[^\w+\-]|$))/gi;
    const isSearchingForLive = query.match(liveRegularExpression);

    return (entry: ResultsEntry): boolean => {
        const isMatchingLive = liveRegularExpression.test(entry.trackName)
            || liveRegularExpression.test(entry.collectionName)
            || liveRegularExpression.test(entry.trackCensoredName)
            || liveRegularExpression.test(entry.collectionCensoredName);

        if (isSearchingForLive) {
            return isMatchingLive;
        } else {
            return !isMatchingLive;
        }
    };
}

function getMatchingEntryFromResult(query: string, entries: Array<ResultsEntry>): ResultsEntry | null {
    if (entries.length > 1) {
        const filterOutLivePredicate = getFilterOutLivePredicate(query);

        entries = entries.filter(filterOutLivePredicate);

        if (entries.length > 0) {
            return entries[0];
        }

        return null;
    } else {
        return entries[0];
    }
}

const appleMusic = Axios.create({
    baseURL: "https://itunes.apple.com",
});

export function SearchAMusic(songName: string): Promise<ProviderResponse> {
    let artwork = "";

    const searchTrack = appleMusic.get<ItunesResponse>(`/search`, {
        params: {
            term: songName,
            country: "ua",
        }
    });

    return searchTrack
        .then((result) => result.data)
        .then((parsedResult: ItunesResponse) => {
            if (parsedResult.resultCount) {
                const track = getMatchingEntryFromResult(songName, parsedResult.results);

                if (track) {
                    artwork = track.artworkUrl100;
                    return track.trackViewUrl;
                } else {
                    return Dictionary.no_result;
                }
            } else {
                return Dictionary.no_result;
            }
        })
        .catch(() => {
            return Dictionary.request_error;
        })
        .then((result: string) => {
            return {
                url: formatResponse("Apple Music", result),
                albumCover: artwork
            };
        });
}
