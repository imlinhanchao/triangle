import { api } from 'src/boot/axios';
import { IAccount, ILogin, IRegister } from '../models/account';
import { BaseResponseSync } from '../models/common';

export function getCurrentUser(): BaseResponseSync<IAccount> {
    return api.get('/account/info').then(r => r.data);
}

export function login(data: ILogin): BaseResponseSync<IAccount> {
    return api.post('/account/login', data).then(r => r.data);
}

export function register(data: IRegister): BaseResponseSync<IAccount> {
    return api.post('/account/create', data).then(r => r.data);
}

export function logout() {
    return api.get('/account/logout').then(r => r.data);
}

export function sendVerify({ email, username }: { email:string, username:string }) {
    return api.post('/account/sendverify', { email, username }).then(r => r.data);
}

export function verify({ username, token }: { username:string, token:string }) {
    return api.post('/account/verify', { username, token }).then(r => r.data);
}