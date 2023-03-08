import { DataTypes, Model } from "sequelize";
import { sequelize } from '../config/db';

class ItemTarget extends Model {}

ItemTarget.init({
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Zhihu_ItemTarget'
});

export class Item extends Model {}

Item.init({
    target: {
        type: DataTypes.INTEGER,
        references: {
            model: ItemTarget,
            key: 'id',
        }
    }
}, { sequelize })

export type Question = {
    title: string;
    url: string;
};

export type HotList = {
    data: Item[];
};