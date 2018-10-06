import {ProviderResponse} from "./interfaces";
import Axios from "axios";
import {Dictionary} from "../core/dictionary";
import {createProviderResponder, formatResponse} from "../core/response";

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

const makeResponse = createProviderResponder("Apple Music");

export async function SearchAMusic(songName: string): Promise<ProviderResponse> {
    try {
        const searchTrack = await appleMusic.get<ItunesResponse>(`/search`, {
            params: {
                term: songName,
                country: "ua",
            }
        });

        if (searchTrack.data.resultCount) {
            const track = getMatchingEntryFromResult(songName, searchTrack.data.results);

            if (track) {
                return makeResponse(track.trackViewUrl, track.artworkUrl100);
            } else {
                return makeResponse(Dictionary.no_result);
            }
        }
    } catch (e) {
        return makeResponse(Dictionary.request_error);
    }

    return makeResponse(Dictionary.no_result);
}
