import * as Telegraf from "telegraf";
import * as config from "config";
import {SearchAMusic} from "./providers/apple-music";
import {SearchGMusic} from "./providers/google-play";
import {SearchSpotify} from "./providers/spotify";

const packageConfig = require("../package.json");

const startDate = new Date();
console.warn(`Start server v${packageConfig.version} (${startDate})`);

const token = config.get("telegramToken");
const bot = new Telegraf(token);
const commandRegexp = /\/songlink /;

bot.hears(commandRegexp, (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");

    console.warn(`==> request: ${songName} | ${new Date()}`);

    const services = [
        SearchAMusic(songName),
        SearchSpotify(songName),
        SearchGMusic(songName)
    ];

    Promise.all(services).then((results) => {
        const reply = results.reduce((buffer, res) => {
            return buffer + res + "\n";
        }, songName + ":\n");
        ctx.reply(reply, {
            parse_mode: "Markdown",
            disable_web_page_preview: true
        });
    });
});
bot.startPolling();
