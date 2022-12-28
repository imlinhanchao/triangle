import { default as dbModule } from '../db';
import { defineModel, dbModel } from '../db'
import { prefix } from '../config.json';

export const db = dbModule;
export const orm = {
    username: {
        type: db.STRING(20),
        comment: '登录帐号'
    },
    nickname: {
        type: db.STRING(20),
        comment: '昵称'
    },
    passwd: {
        type: db.STRING(64),
        comment: '密码'
    },
    email: {
        type: db.STRING(100),
        comment: '邮箱'
    },
    company: {
        type: db.STRING(50),
        comment: '公司',
        default: ''
    },
    location: {
        type: db.STRING(20),
        comment: '所在地',
        default: ''
    },
    url: {
        type: db.STRING(260),
        comment: '个人主页',
        default: ''
    },
    motto: {
        type: db.STRING(200),
        comment: '签名'
    },
    avatar: {
        type: db.STRING(200),
        comment: '头像'
    },
    verify: {
        type: db.BOOLEAN,
        default: 0,
        comment: '邮箱是否验证'
    },
    lastlogin: {
        type: db.INTEGER,
        comment: '最后登录时间'
    }
};

export const tb = prefix + 'account';
export const keys = Object.keys(orm);
const Model: dbModel = defineModel(tb, orm, {
    comment: '用户表',
});
Model.keys = keys;
export default Model;
