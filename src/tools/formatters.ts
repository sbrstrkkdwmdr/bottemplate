import * as Discord from 'discord.js';
import * as helper from '../helper';

export function matchesString(first: string, second: string) {
    first = first.toLowerCase();
    second = second.toLowerCase();
    return first == second ||
        first.includes(second) ||
        second.includes(first);
}

/**
 * gets value from args that can be specified via: `>foo`, `<foo`, `foo` or `!foo`
 * 
 * use filterArgRange to check if a value matches the arg
 */
export function argRange(arg: string, forceAboveZero: boolean) {
    let max = NaN;
    let min = NaN;
    let exact = NaN;
    let ignore = false;
    if (arg.includes('>')) {
        min = +(arg.replace('>', ''));
    }
    if (arg.includes('<')) {
        max = +(arg.replace('<', ''));
    }
    if (arg.includes('..')) {
        const arr = arg.split('..');
        const narr = arr.map(x => +x).filter(x => !isNaN(x)).sort((a, b) => +b - +a);
        if (narr.length == 2) {
            max = narr[0];
            min = narr[1];
        }
    }
    if (arg.includes('!')) {
        exact = +(arg.replace('!', ''));
        ignore = true;
    }
    if (isNaN(max) && isNaN(min) && !exact) {
        exact = +arg;
    }
    if (forceAboveZero) {
        return {
            max: max && max >= 0 ? max : Math.abs(max),
            min: min && min >= 0 ? min : Math.abs(min),
            exact: exact && exact >= 0 ? exact : Math.abs(exact),
            ignore
        };
    }
    return {
        max,
        min,
        exact,
        ignore,
    };
}

/**
 * 
 * @param str the string to convert
 * @returns string with the first letter capitalised
 */
export function toCapital(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function dateToDiscordFormat(date: Date, type?: 'R' | 'F') {
    return `<t:${Math.floor(date.getTime() / 1000)}:${type ?? 'R'}>`;
}

/**
 * check if a value is within the bounds of a given value
 * 
 * floats are rounded to integers
 */
export const filterArgRange = (value: number, args: {
    max: number;
    min: number;
    exact: number;
    ignore: boolean;
}) => {
    let keep: boolean = true;
    if (args.max) {
        keep = keep && value <= Math.round(args.max);
    }
    if (args.min) {
        keep = keep && value >= Math.round(args.min);
    }
    if (args.exact) {
        keep = Math.round(value) == Math.round(args.exact);
    }
    if (args.exact && args.ignore) {
        keep = Math.round(value) != Math.round(args.exact);
    }
    return keep;
};