import axios from 'axios';
import {NextFunction, Request, Response} from "express";
import {Cookie, CookieJar, defaultPath} from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { FileCookieStore } from 'tough-cookie-file-store';
import { join, resolve } from 'path';

const __dirname = resolve();
const cookiePath = join(__dirname, "cookie.json");
const BASE_URL = "https://api.bilibili.com";
export const cookieJar = new CookieJar(new FileCookieStore(cookiePath));

export const bilibili = wrapper(axios.create({
    baseURL: 'https://api.bilibili.com/x/web-interface',
    timeout: 1000,
    method: 'get',
    withCredentials: true,
    jar: cookieJar
}));

export interface BaseResponse {
    code: number;
    message: string;
    ttl: number | null;
}

export const SaveCookie = async (cookies: string[]) => {
    const arr = cookies.map(c => Cookie.parse(c))
        .filter(c => c !== undefined)
        .map(c => c as Cookie);

    for (const cookie of arr) {
        try {
            await cookieJar.setCookie(cookie, BASE_URL);
        } catch (e) {
            console.error(e);
        }
    }
}

export const checkCookies = async (callback: string, res: Response) => {
    const cookies = await cookieJar.getCookies(BASE_URL);
    if (cookies.length > 0) {
        return true;
    }

    res.redirect(`/b/login?callback=${callback}`);
    return false;
};