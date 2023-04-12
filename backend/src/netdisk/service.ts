import express, {NextFunction, Request, Response} from "express";
import {checkIfNeedLogin, Login} from "./users";

export const AliNetDisk = express.Router();

AliNetDisk.use(checkIfNeedLogin);
AliNetDisk.use('/login', Login);