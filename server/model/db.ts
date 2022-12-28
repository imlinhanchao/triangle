import { Sequelize, UUID, UUIDV4, INTEGER, Dialect } from 'sequelize';
import config from './config.json';
const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect as Dialect,
    port: config.port,
    logging: config.logging,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});
const ID_TYPE = UUID;
export function defineModel(name:string, attributes:any, defineAttr = {}) {
    const attrs :any = {};
    if (!attributes.id) {
        attrs.id = {
            type: ID_TYPE,
            defaultValue: UUIDV4,
            primaryKey: true
        };
    }
    for (const key in attributes) {
        const value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.create_time = {
        type: INTEGER,
    };
    attrs.update_time = {
        type: INTEGER,
    };
    return sequelize.define(name, attrs, Object.assign(defineAttr, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeCreate: function (obj:any) {
                const now = (new Date()).valueOf() / 1000;
                if (obj.isNewRecord) {
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    obj.update_time = now;
                }
            },
            beforeBulkCreate: function (records:any) {
              const now = (new Date()).valueOf() / 1000;
                for (const i in records) {
                    if (records[i].isNewRecord) {
                        records[i].create_time = now;
                        records[i].update_time = now;
                    } else {
                        records[i].update_time = now;
                    }
                }
            },
            beforeUpdate: function (obj:any) {
                const now = (new Date()).valueOf() / 1000;
                if (obj.isNewRecord) {
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    obj.update_time = now;
                }
            }
        }
    }));
}

export async function sync () {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({
            force: true
        });
    } else {
        throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    }
}
export const ID = ID_TYPE;
export const bitOp = (field:string, op:string, val:string, eq:any) => {
    return sequelize.where(sequelize.literal(`${field} ${op} ${val}`), eq);
};

import * as SequelizeModule from 'sequelize';
export default SequelizeModule;

export interface dbModel extends SequelizeModule.ModelCtor<any> {
  keys?: string[];
}