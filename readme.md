# Song Sharing-Link Telegram Bot

This bot is used for sharing song with given name via several services at once.

## Getting Started

If you want to test it locally, you should create own bot via Telegram's @botfather
Don't forget to enable inline mode

You will also need to create Spotify account and get clientId and clientSecret if
you want to fix/improve Spotify related code

### Installing

After you've cloned that repo and got bot token, you should run

```
$: npm i
```

This will install all dependencies

Then you can fill local.json file using local.sample.json as reference

After this you are ready to run the bot.

```
$: npm run dev // <- this will run watcher and compiler
$: npm start // <- this will run the bot
```

### Coding style tests

This project has TS-lint enabled so you will be warned if you are breaking the law of codestyle

## Deployment

You can run this bot on any computer or dedicated server with no affect on end user experience.
The only point is that srcipt should be up 24/7 or bot will respond with delays, which is annoying

## Contributing

Tip: you can comment out services that you are no working on right now.

Please read CONTRIBUTING.md

## Authors

* **Danil Radkovsky** - *Initial work, Author of idea* - [Krakabek](https://github.com/Krakabek)
* **Alexandr Rodik** - *Infractructure solutions, Supporter of idea* - [arodik](https://github.com/https://github.com/arodik)

See also the list of [contributors](https://github.com/Krakabek/songSearchBot/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Idea of this bot was born in group chat where 4 people used different streaming music services
* Thanks for Telegram as this is the best messenger in 2k18
