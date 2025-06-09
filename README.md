# Bot template

discord.js bot template based off of [SSoB](https://github.com/sbrstrkkdwmdr/ssob)



## Install/setup

install nodejs (v16) [here](https://nodejs.org/en/download/)

install all dependencies with `npm i` in the main directory

in the `./config/` folder rename `tempconfig.json` to `config.json`

`config.json` should look like this:

```json
{
    "token": "xxx",
    "osu": {
        "clientId": "xxx",
        "clientSecret": "xxx"
    },
    "prefix": "xxx",
    "owners": ["xxx"],
    "logs": {
        "console": true,
        "file": true
    }
}
```

change the values in `config.json` (see [here](#config-properties)) </br>
check `src/consts/emojis.ts` and `src/consts/buttons.ts` and change the emojis that are formatted as <:name:ID:> (reupload\* to a private server that the bot is in) </br>
emoji images are found under `./files/emojis/` </br>
to get the emoji id, type the emoji then put a `\` in front of it</br>
to compile the bot the bot use `tsc` or `npm run build`</br>
to run the compiled code use `npm run run` </br>
to compile then immediately use `npm run br` </br>

## required permissions

disabling these permissions will disable the commands listed

| Permission    | Usage                                                     | Affected Commands |
| ------------- | --------------------------------------------------------- | ----------------- |
| EmbedLinks    | Most commands display information via the use of _embeds_ | All commands      |
| Administrator | To access certain data                                    | checkperms, find  |

## Config Properties

| Property | Type     | Description                                                                                                                                                                                           |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token    | string   | application token for bot to connect to discords API. </br>go to https://discord.com/developers/applications, create a new app, and create a new bot under the bot section. copy the token from there |
| prefix   | string   | a string at the start of each message to detect if a message is a command. eg. `!` => `!ping` would ping the bot and `?ping` or `ping` wouldn't.                                                      |
| owners   | string[] | an array of user ids stored as strings. users with these ids can use any command                                                                                                                      |
| logs     | object   | see [here](#config-logging-properties)                                                                                                                                                                |

### Config logging properties

| Property | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| console  | boolean | Logs are output to the console                       |
| file     | boolean | Logs are saved to the logs folder (`dist/src/logs/`) |
