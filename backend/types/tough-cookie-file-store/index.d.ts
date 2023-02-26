import { Store } from 'tough-cookie';

declare class FileCookieStore extends Store {
    filePath: string;
    constructor (filePath: string);
}