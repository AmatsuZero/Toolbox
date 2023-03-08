import { Sequelize } from 'sequelize';
import {join} from "path";
import {__dirname} from "../global";

const storage = join(__dirname, "storage", "database.sqlite");

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: console.log,
});

export const InitDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}