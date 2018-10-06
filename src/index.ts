import * as config from "config";
import * as Telegraf from "telegraf";
import {SearchAMusic} from "./providers/apple-music";
import {SearchGMusic} from "./providers/google-play";
import {SearchSpotify} from "./providers/spotify";
import {SearchYoutube} from "./providers/youtube";

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
    SearchYoutube(songName)
];

bot.hears(commandRegexp, (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");

    console.warn(`==> request: ${songName} | ${new Date()}`);

    Promise.all(getServices(songName)).then((results) => {
        const reply = results.reduce((buffer, res) => {
            return buffer + res.url + "\n";
        }, songName + ":\n");
        ctx.reply(reply, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
        });
    });
});

bot.on("inline_query", (ctx: any) => {
    const songName = ctx.inlineQuery.query;

    if (!songName) {
        return ctx.answerInlineQuery([]);
    }

    console.warn(`==> request [${new Date()}]: ${songName}`);

    Promise.all(getServices(songName)).then((results) => {
        let thumbnail = "";
        const reply = results.reduce((buffer, res) => {
            if (res.albumCover && !thumbnail) {
                thumbnail = res.albumCover;
            }
            return buffer + res.url + "\n";
        }, songName + ":\n");

        const answer = [{
            type: "article",
            id: `song:${songName}`,
            title: songName,
            input_message_content: {
                message_text: reply,
                parse_mode: "Markdown",
                disable_web_page_preview: true
            },
            thumb_url: thumbnail,
            thumb_width: 128,
            thumb_height: 128
        }];
        return ctx.answerInlineQuery(answer);
    });
});

bot.startPolling();
