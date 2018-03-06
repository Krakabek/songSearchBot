import {SearchAMusic} from "./apple-music";

const Telegraf = require("telegraf");
const token = "ask Krakabek";

const bot = new Telegraf(token);
const commandRegexp = /\/songlink /;

bot.hears(commandRegexp, (ctx: any) => {
    const songName = ctx.message.text.replace(commandRegexp, "");
    SearchAMusic(songName).then((result) => {
        ctx.reply(result + "\n");
    })
});
bot.startPolling();
