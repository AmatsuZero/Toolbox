import express from 'express';
import { GetPopularData } from './rank';
import {CheckShouldJump, Login} from './login';
import { checkCookies } from "./base";

export const Bilibili = express.Router();

Bilibili.use(checkCookies);

Bilibili.use('/popular', GetPopularData);
Bilibili.use('/login', Login);
Bilibili.use('/checkStatus', CheckShouldJump);