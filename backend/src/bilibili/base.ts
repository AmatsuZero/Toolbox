import axios from 'axios';

export const bilibili = axios.create({
    baseURL: 'https://api.bilibili.com/x/web-interface',
    timeout: 1000,
    method: 'get'
});

export interface BaseResponse {
    code: number;
    message: string;
    ttl: number;
};