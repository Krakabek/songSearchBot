import * as config from "config";
import * as Telegraf from "telegraf";
import {SearchAMusic} from "./providers/apple-music";
import {SearchGMusic} from "./providers/google-play";
import {SearchSpotify} from "./providers/spotify";
import {SearchYoutube} from "./providers/youtube";
import {SearchSoundCloud} from "./providers/soundcloud";

const packageConfig = require("../package.json");

const startDate = new Date();
console.warn(`Start server v${packageConfig.version} (${startDate})`);

const token = config.get("telegramToken");
const bot = new Telegraf(token);
const commandRegexp = /\/songlink /;

const getServices = (songName: string) => [
    SearchAMusic(songName),
    SearchSpotify(songName),
    SearchGMusic(songName),
    SearchYoutube(songName),
    SearchSoundCloud(songName),
];

const shutDownWarning = "**WARNING: SongLinkBot will be shut down soon\nWe ran out of free hosting plan\n\n**";

bot.hears(commandRegexp, async (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");

    console.warn(`==> request: ${songName} | ${new Date()}`);

    const searchResult = await Promise.all(getServices(songName));

    let responseHeading = shutDownWarning + songName + ":\n";
        const reply = searchResult.reduce((buffer, res) => {
        return buffer + res.url + "\n";
    }, responseHeading);

    ctx.reply(reply, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
    });
});

bot.on("inline_query", async (ctx: any) => {
    const songName = ctx.inlineQuery.query;

    if (!songName) {
        return ctx.answerInlineQuery([]);
    }

    console.warn(`==> request [${new Date()}]: ${songName}`);

    const searchResult = await Promise.all(getServices(songName));

    let thumbnail = "";
    const reply = searchResult.reduce((buffer, res) => {
        if (res.albumCover && !thumbnail) {
            thumbnail = res.albumCover;
        }
        return buffer + res.url + "\n";
    }, songName + ":\n");

    const answer = [{
        type: "article",
        id: `song:${songName}`,
        title: shutDownWarning + songName,
        input_message_content: {
            message_text: reply,
            parse_mode: "Markdown",
            disable_web_page_preview: true
        },
        thumb_url: thumbnail,
        thumb_width: 128,
        thumb_height: 128
    }];

    ctx.answerInlineQuery(answer);
});

bot.startPolling();
