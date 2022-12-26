import exp from 'app/server/model/db';

export interface IUserBaseInfo {
    username: string;
    nickname?: string;
    avatar?: string;
    company?: string;
    email?: string;
    location?: string;
    motto?: string;
    url?: string;
}

export interface IAccount extends IUserBaseInfo {
    id: string;
    verify: boolean;
    lastlogin: number;
}

export interface ILogin {
    username: string;
    passwd: string;
}

export interface IRegister extends IUserBaseInfo {
    passwd: string;
    captcha: string;
}

export interface IUpdateInfo extends IUserBaseInfo {
    passwd?: string;
    oldpasswd?: string;
}