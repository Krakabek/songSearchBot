import * as Telegraf from "telegraf";
import {SearchAMusic} from "./apple-music";
import {config} from "./config";
import {SearchSpotify} from "./spotify";

const token = config.telegramToken;

const bot = new Telegraf(token);
const commandRegexp = /\/songlink /;

bot.hears(commandRegexp, (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");
    const services = [
        SearchAMusic(songName),
        SearchSpotify(songName)
    ];
    Promise.all(services).then((results) => {
        const reply = results.reduce((buffer, res) => {
            return buffer + res + "\n";
        }, songName + ":\n");
        ctx.reply(reply, {
            disable_web_page_preview: true
        });
    });
});
bot.startPolling();
