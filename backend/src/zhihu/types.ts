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

Item.hasOne(ItemTarget);

Item.init({
    target: {
        type: DataTypes.INTEGER,
        references: {
            model: ItemTarget,
            key: 'id',
        }
    }
}, {
    sequelize,
    modelName: 'Zhihu-Item'
})

export class Question extends Model {}

Question.init({
    title: {
        type: DataTypes.STRING,
    },
    url: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    modelName: 'Zhihu-Question'
})

export class HotList extends Model {
    // data: Item[];
}

HotList.hasMany(Item);