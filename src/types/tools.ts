import * as bot from './bot';

export type Dict<T = any> = { [key: string]: T; };
export type DictEntry<T = any> = { (key: string): T; };