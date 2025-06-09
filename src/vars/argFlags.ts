export const pages = toFlag([
    'p', 'page'
]);

export const details = toFlag([
    'd', 'details', 'detailed', 'detail'
]);
export const compress = toFlag([
    'c', 'compress', 'compressed'
]);

export function toFlag(args: string[]) {
    return args.map(x => `-${x}`);
}