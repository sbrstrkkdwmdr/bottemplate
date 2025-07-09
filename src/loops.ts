// recurring functions
import Discord from 'discord.js';
import fs from 'fs';
import * as helper from './helper';
import * as log from './tools/log';
export function loops() {
    setInterval(() => {
        clearParseArgs();
    }, 60 * 60 * 1000);

    setInterval(() => {
        clearCommandCache();
    }, 1000 * 60);

    clearParseArgs();
    clearCommandCache();

    // status switcher
    const activities = [];

    function setActivity() {
        let string = 'you';
        let fr = 3;

        helper.vars.client.user.setPresence({
            activities: [{
                name: `${string} | ${helper.vars.config.prefix}help`,
                type: fr,
                url: 'https://twitch.tv/sbrstrkkdwmdr'
            }],
            status: 'dnd',
            afk: false
        });
        return 1000 * 60 * 60;
    }
    const activityChristmas = [
        {
            name: `Merry Christmas! | ${helper.vars.config.prefix}help`,
            type: 0,
            url: 'https://twitch.tv/sbrstrkkdwmdr',
        },
        {
            name: `🎄 | ${helper.vars.config.prefix}help`,
            type: 0,
            url: 'https://twitch.tv/sbrstrkkdwmdr',
        },
    ];
    const activityHalloween = [{
        name: `Happy Halloween! | ${helper.vars.config.prefix}help`,
        type: 0,
        url: 'https://twitch.tv/sbrstrkkdwmdr',
    },
    {
        name: `🎃 | ${helper.vars.config.prefix}help`,
        type: 0,
        url: 'https://twitch.tv/sbrstrkkdwmdr',
    }
    ];
    const activityNewYear = [{
        name: `Happy New Year! | ${helper.vars.config.prefix}help`,
        type: 0,
        url: 'https://twitch.tv/sbrstrkkdwmdr',
    },
    {
        name: `Happy New Year!! | ${helper.vars.config.prefix}help`,
        type: 0,
        url: 'https://twitch.tv/sbrstrkkdwmdr',
    },
    {
        name: `Happy New Year!!! | ${helper.vars.config.prefix}help`,
        type: 0,
        url: 'https://twitch.tv/sbrstrkkdwmdr',
    }
    ];

    //seasonal status updates
    const Events = ['None', 'New Years', 'Halloween', 'Christmas'];

    let curEvent = Events[0];
    let activityarr = activities;

    let timer = 60 * 1000;
    updateStatus();

    setInterval(() => {
        updateStatus();
    }, timer);

    function updateStatus() {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        let specialDay = false;
        if ((month == 12 && day == 31) || (month == 1 && day == 1)) {
            curEvent = Events[1];
            activityarr = activityNewYear;
            specialDay = true;
        }
        else if (month == 10 && day == 31) {
            curEvent = Events[2];
            activityarr = activityHalloween;
            specialDay = true;
        } else if (month == 12 && day == 25) {
            curEvent = Events[3];
            activityarr = activityChristmas;
            specialDay = true;
        } else {
            curEvent = Events[0];
            activityarr = activities;
        }
        if (specialDay == true) {
            helper.vars.client.user.setPresence({
                activities: [activityarr[Math.floor(Math.random() * activityarr.length)]],
                status: 'dnd',
                afk: false
            });
            timer = 10 * 60 * 1000;
        } else {
            const temp = setActivity();
            timer = temp > 60 * 1000 * 30 ?
                60 * 1000 : temp * 1000;
        }
    }

    // clear cache
    const cacheById = [
    ];

    const permanentCache = [
    ];

    function clearCommandCache() {
        const files = fs.readdirSync(`${helper.vars.path.cache}/commandData`);
        for (const file of files) {
            fs.stat(`${helper.vars.path.cache}/commandData/` + file, (err, stat) => {
                if (err) {
                    log.stdout(err);
                    return;
                } else {
                    if (permanentCache.some(x => file.startsWith(x))) {
                        //if amount of permcache mapfiles are < 100, keep them. otherwise, delete

                        if ((new Date().getTime() - stat.mtimeMs) > (1000 * 60 * 60 * 24 * 28) && files.filter(x => permanentCache.some(x => file.startsWith(x))).length >= 100) {
                            //kill after 4 weeks
                            fs.unlinkSync(`${helper.vars.path.cache}/commandData/` + file);
                            log.stdout(`Deleted file ${helper.vars.path.cache}/commandData/` + file,);
                        }
                    }
                    else if (cacheById.some(x => file.startsWith(x))) {
                        if ((new Date().getTime() - stat.mtimeMs) > (1000 * 60 * 60 * 24)) {
                            fs.unlinkSync(`${helper.vars.path.cache}/commandData/` + file);
                            log.stdout(`Deleted file ${helper.vars.path.cache}/commandData/` + file,);
                            // fs.appendFileSync('logs/updates.log', `\ndeleted file "${file}" at ` + new Date().toLocaleString() + '\n')
                        }
                    } else if (file.includes('weatherdata')) {
                        if ((new Date().getTime() - stat.mtimeMs) > (1000 * 60 * 15)) {
                            fs.unlinkSync(`${helper.vars.path.cache}/commandData/` + file);
                            log.stdout(`Deleted file ${helper.vars.path.cache}/commandData/` + file,);
                            // fs.appendFileSync('logs/updates.log', `\ndeleted file "${file}" at ` + new Date().toLocaleString() + '\n')
                        }
                    }
                    else {
                        if ((new Date().getTime() - stat.mtimeMs) > (1000 * 60 * 60 * 3)) {
                            fs.unlinkSync(`${helper.vars.path.cache}/commandData/` + file);
                            log.stdout(`Deleted file ${helper.vars.path.cache}/commandData/` + file,);
                            // fs.appendFileSync('logs/updates.log', `\ndeleted file "${file}" at ` + new Date().toLocaleString() + '\n')
                        }
                    }
                }
            });

        }
    }
    function clearParseArgs() {
        const files = fs.readdirSync(`${helper.vars.path.cache}/params`);
        for (const file of files) {
            fs.stat(`${helper.vars.path.cache}/params/` + file, (err, stat) => {
                if ((new Date().getTime() - stat.mtimeMs) > (1000 * 60 * 60 * 24)) {
                    fs.unlinkSync(`${helper.vars.path.cache}/params/` + file);
                    log.stdout(`Deleted file ${helper.vars.path.cache}/params/` + file,);
                    // fs.appendFileSync('logs/updates.log', `\ndeleted file "${file}" at ` + new Date().toLocaleString() + '\n')
                }
            });
        }
    }
}