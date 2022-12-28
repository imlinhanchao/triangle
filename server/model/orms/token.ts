import { default as dbModule } from '../db';
import { defineModel, dbModel } from '../db'
import { prefix } from '../config.json';

export const db = dbModule;
export const orm = {
  username: {
    type: db.STRING(20),
    comment: '登录帐号'
  },
  token: {
      type: db.STRING(64),
      comment: 'Token'
  },
};

export const tb = prefix + 'token';
export const keys = Object.keys(orm);
const Model: dbModel = defineModel(tb, orm, {
  comment: '验证 Token 表',
});
Model.keys = keys;
export default Model;
