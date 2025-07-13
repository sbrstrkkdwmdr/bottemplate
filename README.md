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

### 1. creating commands

-   extend the `Command` class from `src/commands/command.ts` or copy-paste the command template in the same file (you can use the commands already implemented such as ping as reference)
-   set the name property in the constructor

-   to add parameters, modify the params property in the new command and then set the default value of each arg in the constructor

```ts
class Test extends Command {
    // set param types
    // because params is already defined in Command, it requires the `declare` keyword
    protected declare params: {
        test: boolean;
        page: number;
        mode: "main" | "alternate";
    };
    constructor() {
        super();
        this.name = "test"; // command automatically sets this to "Test" instead of "test"
        // set params default values
        this.params = {
            test: false,
            page: 0,
            mode: "main",
        };
    }
    // ...
}
```

-   to implement message params, modify the `setParamsMsg()` method
-   params that use flags can use the `setParam()` method
-   for params that use flags, you can follow this template code:

```ts
// note -
// in `!rs -p 2 -d` the args would be ['-p' '2' '-d']

// commands that use pages can use this built-in method
this.setParamPage();

// strings and numbers
// "-page 2" -> page = 2
// if page isnt found, return 1
this.params.page = this.setParam(1, ["-page", "-p"], "number", {
    number_isInt: true,
});

// booleans
// "-test" -> test = true
// in this example, if "-test", is not found, then return false
// if "-test" is found, return true
this.params.test = this.setParam(false, ["-test"], "bool", {});

// "-alt" -> mode = alt
// if "-alt" or "-other" is found, set mode to "alternate"
// else, return current mode
this.params.mode = this.setParam(this.params.mode, ["-alt", "-other"], "bool", {
    bool_setValue: "alternate",
});
```

-   to implement interaction params, modify the `setParamsInteract()` method
-   for each arg, use the various getters in `interaction.options`
    eg.

```ts
this.params.page = interaction.options.getInteger("page");
```

-   button params can either be passed via the `overrides` property in the button handler, or can be retrieved from param files stored in cache.
-   buttons such as page buttons can be used like so:

```ts
helper.tools.commands.buttonPage(page, maxPage, this.input.buttonType);
```

-   using param files:

```ts
// for button args that are stored in cache
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

-   to create param files

```ts
// from https://github.com/sbrstrkkdwmdr/ssob/blob/2ad48ebba57fce74ead27948f1b4f87b26be8773/src/commands/osu_scores.ts#L1436
helper.tools.commands.storeButtonArgs(this.input.id, {
    user: this.params.user,
    searchid: this.params.searchid,
    page: this.params.page + 1,
    maxPage: this.scores.length,
    mode: this.params.mode,
    fails: this.params.showFails,
    filterTitle: this.params.filter,
});
```

-   each setParams method is called via `this.setParams()` when needed, so you can just call that method instead of each individual method
-   to retrieve override params, modify the `getOverrides()` method
-   override params are used for some commands that don't directly send the interaction to the original command message (eg. page selectors)

```ts
    getOverrides(): void {
        // do nothing if no override values are set
        if (!this.input.overrides) return; 
        
        // checks if overrides.page is set, then sets params.page
        this.setParamOverride('page'); 
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

-   interaction commands only allow one reply at a time, so make sure to avoid sending multiple replies if possible. If multiple are needed, you can always set `this.ctn.edit` to true after the first reply or use `interaction.channel.send()`
-   interaction commands also time out after a few seconds, so if the command takes a while to load, you can send a reply with a loading message, then at the end update it with `this.ctn.edit` set to true

-   optionally, you can also let your command be accessible in the help command. To do this, add it to `cmds[]` in `src/vars/commandData.ts`

### 2. adding command to the command handlers

-   in `src/commandHandler` add the command name and it's aliases to the switch statement `commandSelect()` like so:

```ts
case 'test':
    command = new helper.commands.command.Test();
    break;
```

-   if the command uses embeds, or has other requirements, you can add its name to the arrays in commandCheck

-   if the command also takes button inputs, you can add it to the switch statement at the bottom of `async onInteraction()` in `src/buttonHandler.ts`

-   if the command is meant to be a `/` (slash) command add it to `src/slashCommands.ts` at the bottom of `commands?.set` in `run()`
