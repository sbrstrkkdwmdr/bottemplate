# Bot template

discord.js bot template based off of [SSoB](https://github.com/sbrstrkkdwmdr/ssob)

to add custom commands see [here](#adding-commands) </br>

commands that are already in the bot:

-   help
-   info
-   invite
-   ping
-   roll
-   stats

### Admin only

-   checkperms
-   find
-   prefix

### Owner only

-   clear
-   crash
-   debug
-   leaveguild
-   servers

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

## adding commands

### creating command

-   extend the `Command` class from `src/commands/command.ts` or copy-paste the command template in the same file (you can use the commands already implemented such as ping as reference)
-   set the name property in the constructor

-   to add args, modify the args property in the new command and then set the default value of each arg in the constructor

```ts
class Test extends Command {
    protected declare args: {
        test: boolean;
        page: number;
        mode: "main" | "alternate";
    };
    constructor() {
        super();
        this.name = "Test";
        this.params = {
            test: false,
            page: 0,
            mode: "main",
        };
    }
    // ...
}
```

-   to implement message args, modify the `setParamsMsg()` method
-   for args that use flags, you can use this template code:

```ts
// note - 
// in `!rs -p 2 -d` the args would be ['-p' '2' '-d']

// strings and numbers
// "-page 2" -> page = 2
if (this.input.args.includes("-page")) {
    const temp = helper.tools.commands.parseArg(
        this.input.args,
        "-page",
        "number",
        this.params.ar
    );
    this.params.page = temp.value;
    this.input.args = temp.newArgs;
}

// booleans
// "-test" -> test = true
if (this.input.args.includes("-test")) {
    this.params.test = true;
}

// "-alt" -> mode = alt
if (this.input.args.includes("-alt")) {
    this.params.mode = "alternate";
}

// args with aliases
// "-p 4" -> page = 4
// "-page 4" -> page = 4
const pageArgFinder = helper.tools.commands.matchArgMultiple(
    ["-p", "-page"],
    this.input.args,
    true,
    "number",
    false,
    true
);
if (pageArgFinder.found) {
    this.params.page = pageArgFinder.output;
    this.input.args = pageArgFinder.args;
}
```

-   to implement interaction args, modify the `setParamsInteract()` method
-   for each arg, use the various getters in `interaction.options`
    eg.

```ts
this.params.page = interaction.options.getInteger("page");
```

-   button args can either be passed via the `overrides` property in the button handler, or can be retrieved from param files stored in cache.
-   buttons such as page buttons can be used like so:

```ts
helper.tools.commands.buttonPage(page, maxPage, this.input.buttonType);
```

using param files:

```ts
const temp = helper.tools.commands.getButtonArgs(this.input.id);
if (temp.error) {
    interaction.followUp({
        content: helper.vars.errors.paramFileMissing,
        flags: Discord.MessageFlags.Ephemeral,
        allowedMentions: { repliedUser: false },
    });
    helper.tools.commands.disableAllButtons(this.input.message);
    return;
}
this.params.page = temp.page;
```

-   each setParams method is called via `this.setParams()` when needed, so you can just call that method instead of each individual method
-   to retrieve override args, modify the `getOverrides()` method

```ts
    getOverrides(): void {
        if (!this.input.overrides) return; // do nothing if no override values are set
        if (this.input.overrides?.page != null) {
            this.params.page = this.input.overrides.page;
        }
    }
```

-   overrides are stored in `this.input.overrides`
-   getOverrides isn't stored in setParams, so it make sure to add it to the execute method if needed
-   if you wish to log each command used, make sure to call `this.logInput()` after `this.setParams()`

-   if the command is meant to output a message, make sure to set the content via `this.ctn`, and call `this.send()` afterwards

```ts
async execute(){
    this.ctn.content = "Hello, world!";
    this.send();
}
```

-   if the command uses `this.send()` multiple times you can clear `this.ctn` with `this.voidcontent()`

```ts
async execute(){
    this.ctn.content = "Hello, world!";
    this.send();
    this.voidcontent();
    const embed = new Discord.EmbedBuilder()
        .setTitle("Hello, world!")
        .setDescription("Hello, world!");
    this.ctn.embeds = [embed];
    this.send();
}
```

-   interaction commands only allow one reply at a time, so make sure to avoid sending multiple replies if possible. If multiple are needed, you can always set `this.ctn.edit` to true after the first reply
-   interaction commands also time out after a few seconds, so if the command takes a while to load, you can send a reply with a loading message, then at the end update it with `this.ctn.edit` set to true

-   optionally, you can also let your command be accessible in the help command. To do this, add it to `cmds[]` in `src/vars/commandData.ts`

### adding command to the command handlers

-   in `src/commandHandler` add the command name and it's aliases to the switch statement `commandSelect()` like so:

```ts
case 'test':
    command = new helper.commands.command.Test();
    break;
```

-   if the command uses embeds, or has other requirements, you can add it's name to the arrays in commandCheck

-   if the command also takes button inputs, you can add it to the switch statement at the bottom of `async onInteraction()` in `src/buttonHandler.ts`

-   if the command is meant to be a `/` (slash) command add it to `src/slashCommands.ts` at the bottom of `commands?.set` in `run()`
