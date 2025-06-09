import Discord from 'discord.js';
import fs from 'fs';
import * as helper from '../helper.js';
import * as tooltypes from '../types/tools.js';

export function appendUrlParamsString(url: string, params: string[]) {
    let temp = url;
    for (let i = 0; i < params.length; i++) {
        const cur = encodeURIComponent(params[i]).replace('%3D', '=');
        if (!cur) { break; }
        temp.includes('?') ?
            temp += `&${cur}` :
            `?${cur}`;
    }
    return temp;
}

/**
 * saves data to debug cache
 */
export function debug(data: any, type: string, name: string, serverId: string | number, params: string) {
    const pars = params.replaceAll(',', '=');
    if (!fs.existsSync(`${helper.vars.path.main}/cache/debug/${type}`)) {
        fs.mkdirSync(`${helper.vars.path.main}/cache/debug/${type}`);
    }
    if (!fs.existsSync(`${helper.vars.path.main}/cache/debug/${type}/${name}/`)) {
        fs.mkdirSync(`${helper.vars.path.main}/cache/debug/${type}/${name}`);
    }
    try {
        if (data?.input?.config) {
            data.helper.vars.config = helper.tools.other.censorConfig();
        }
        fs.writeFileSync(`${helper.vars.path.main}/cache/debug/${type}/${name}/${pars}_${serverId}.json`, JSON.stringify(data, null, 2));
    } catch (error) {
    }
    return;
}

/**
 * sort list by closest match to input
 * 
 * 
 */
export function searchMatch(input: string, list: string[]) {
    const sort: {
        factor: number,
        text: string;
    }[] = [];
    for (const word of list) {
        let tempFactor = 0;
        //if length match add 1
        if (input.length == word.length) {
            tempFactor += 1;
        }
        //for each letter in the word that is found in the word, add 1, dont repeat
        const tempArr = word.split('');
        const tempArrIn = input.split('');
        for (let i = 0; i < tempArr.length; i++) {
            for (let j = 0; j < tempArrIn.length; j++) {
                if (tempArr[i] == tempArrIn[j]) {
                    tempFactor += 1;
                    tempArr.splice(tempArr.indexOf(tempArr[i]), 1);
                    tempArrIn.splice(tempArrIn.indexOf(tempArrIn[j]), 1);
                }
            }
        }
        //for each letter with same pos add 1, dont repeat
        for (let i = 0; i < input.length; i++) {
            if (input.trim().toLowerCase().charAt(i) == word.trim().toLowerCase().charAt(i)) {
                tempFactor += 2;
            }
        }
        if (word.trim().toLowerCase().includes(input.trim().toLowerCase()) || input.trim().toLowerCase().includes(word.trim().toLowerCase())) {
            tempFactor += 4;
        }
        const tempWordArr = word.split(' ');
        word.includes(' ') ? word.split(' ') : [word];
        const tempWordArrIn = input.split(' ');
        input.includes(' ') ? input.split(' ') : [input];
        for (const sub of tempWordArr) {
            if (tempWordArrIn.includes(sub)) {
                tempFactor += 3;
                tempWordArrIn.splice(tempWordArrIn.indexOf(sub), 1);
            }
        }

        if (word.trim().toLowerCase() == input.trim().toLowerCase()) {
            tempFactor += 1e10;
        }
        sort.push({ factor: tempFactor, text: word });
    }
    sort.sort((a, b) => b.factor - a.factor);
    return sort.map(x => x.text);
}

/**
 * remove duplicate elements from an array
 */
export function removeDupes(arr: any[]) {
    return arr.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}

/**
 * filters array by search. 
 * 
 * returns array with items that include the search string
 */
export function filterSearchArray(arr: string[], search: string) {
    return arr.filter((el) => el.toLowerCase().includes(search.toLowerCase()));
}

export function censorConfig() {
    return {
        "token": "!!!",
        "prefix": "!!!",
        "owners": ["!!!"],
        "enableTracking": null,
        "logs": null
    };
}

export function ubitflagsAsName(flags: Discord.UserFlagsBitField) {
    helper.tools.log.stdout(flags);
    const fl = flags.toArray();
    helper.tools.log.stdout(fl);
    return 'aa';
}

export function userbitflagsToEmoji(flags: Discord.UserFlagsBitField) {
    const temp = flags.toArray();
    const tempMap = temp.map(x => helper.vars.emojis.discord.flags[x]);
    const newArr: string[] = [];
    for (let i = 0; i < temp.length; i++) {
        let a = '';
        if (!tempMap[i] || tempMap[i].length == 0) {
            a = temp[i];
        } else {
            a = tempMap[i];
        }
        newArr.push(a);
    }
    return newArr;
}

/**
 * converts an array to a list of items
 * 
 * * [1,2,3,4] -> "1, 2, 3, and 4"
 * * [1,2] -> "1 and 2"
 */
export function listItems(list: string[]) {
    let string = ''
    if(list.length > 1){

        for (let i = 0; i < list.length - 2; i++) {
            string += list[i] + ', ';
        }
        string += list[list.length - 2] + ' and ' + list[list.length - 1];
    } else {
        return list[0];
    }
    return string;
}