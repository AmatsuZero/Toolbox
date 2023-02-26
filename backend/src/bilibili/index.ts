import express from 'express';
import { GetPopularData } from './rank';
import {CheckShouldJump, Login} from './login';

export const Bilibili = express.Router();

Bilibili.use('/popular', GetPopularData);
Bilibili.use('/login', Login);
Bilibili.use('/checkStatus', CheckShouldJump);