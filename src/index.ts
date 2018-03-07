import {config} from "./config";
import {SearchAMusic} from "./apple-music";
import * as Telegraf from "telegraf";

const token = config.telegramToken;

const bot = new Telegraf(token);
const commandRegexp = /\/songlink /;

bot.hears(commandRegexp, (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");
    SearchAMusic(songName).then((result) => {
        ctx.reply(result + "\n");
    });
});
bot.startPolling();
