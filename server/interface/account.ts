import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import model from '../model';
import config from '../config.json';
import App from './app';
const Account = model.account;
const Token = model.token;

const __salt = config.base.salt;
const __tpl:any = {
    verify: {
        data: '',
        path: path.join(__dirname, '..', 'assets', 'verify_mail.html')
    },
    forget: {
        data: '',
        path: ''
    }
};

const __error__ = Object.assign({
    verify: App.error.reg('帐号或密码错误！'),
    captcha: App.error.reg('验证码错误！'),
    existed: App.error.existed('帐号'),
    existedmail: App.error.existed('邮箱'),
    existedphone: App.error.existed('电话'),
    notexisted: App.error.existed('帐号', false),
    notverify: App.error.existed('验证已失效', false, true),
    usertooshort: App.error.reg('用户名太短！'),
    passtooshort: App.error.reg('密码太短！'),
}, App.error);

class Module extends App {
    session:any
    saftKey: string[];
    constructor(session:any) {
        super({ 
          login: '登录成功',
          logout: '登出成功',
          get: '获取成功' ,
          send: '发送成功' ,
          verify: '验证成功' ,
        });
        this.session = session;
        this.name = '用户';
        this.saftKey = ['id'].concat(Account.keys().filter((k:string) => ['passwd'].indexOf(k) < 0));
    }

    get error() {
        return __error__;
    }

    static get cache() {
        return {
            avatar: 86900
        }
    }

    async login(data:any) {
        const keys = ['username', 'passwd'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        if (data.username.length < 5) {
            throw this.error.usertooshort;
        }

        if (data.passwd.length < 5) {
            throw this.error.passtooshort;
        }

        data = App.filter(data, keys);

        try {
            const account = await this.exist(data.username, true);
            if (!account) {
                throw this.error.verify;
            } else {
                const sha256 = crypto.createHash('sha256');
                const passwd = sha256.update(data.passwd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
            }

            account.lastlogin = new Date().valueOf() / 1000;
            account.save();

            this.session.account_login = account;
            return this.ok.login(App.filter(this.session.account_login, this.saftKey));
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (this.error.network(err));
        }
    }

    async create(data:any, onlyData = false) {
        const keys = ['username', 'passwd', 'email'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, Account.keys().concat(['captcha']));

        try {
            if (this.session.captcha != data.captcha)
                throw this.error.captcha;

            if (data.email) {
                const account = await Account.findOne({
                    where: {
                        email: data.email
                    }
                });
                if (account) {
                    throw this.error.existedmail;
                }
            }

            data.nickname = data.username;
            data.lastlogin = new Date().valueOf() / 1000;
            const sha256 = crypto.createHash('sha256');
            data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            data.email = data.email || '';
            data.motto = data.motto || '';
            data.avatar = data.avatar || '';
            data.company = data.company || '';
            data.location = data.location || '';
            data.url = data.url || '';
            data.verify = false;
            const account = await super.new(data, Account, 'username');
            if (onlyData) return account;

            this.sendverify({ email: data.email, username: data.username });
            return this.ok.create(App.filter(account, this.saftKey));
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async update(data:any) {
        const keys = ['username'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, Account.keys().concat(['id', 'oldpasswd']));

        try {
            const account = await this.info(true, Account.keys());
            if (account.username != data.username) {
                throw this.error.limited;
            }
            // 用户名不可更改
            data.username = undefined;
            if (data.passwd) {
                let sha256 = crypto.createHash('sha256');
                const passwd = sha256.update(data.oldpasswd + __salt).digest('hex');
                if (account.passwd != passwd) {
                    throw this.error.verify;
                }
                sha256 = crypto.createHash('sha256');
                data.passwd = sha256.update(data.passwd + __salt).digest('hex');
            }

            // Mail 更新重复检查
            if (data.email && data.email != account.email) {
                const account = await Account.findOne({
                    where: {
                        email: data.email
                    }
                });
                if (account) {
                    throw this.error.existedmail;
                }
                data.verify = false;
                Token.destroy({
                    where: {
                        username: data.username
                    }
                })
            }

            return this.ok.update(App.filter(await super.set(data, Account), this.saftKey));
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exist(username:string, onlyData = false) {
        try {
            const data = await Account.findOne({
                where: {
                    username: username
                }
            });
            if (onlyData) return data;
            return this.ok.get(!!data);
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    async exists(data:any, onlyData = false) {
        const keys = ['email', 'phone'];

        if (!App.hasone(data, keys)) {
            throw (this.error.param);
        }

        data = App.filter(data, keys);
        try {
            const account = await Account.findOne({
                where: data
            });
            if (onlyData) return account;
            return this.ok.get(!!account);
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (this.error.db(err));
        }
    }

    logout() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        this.session.account_login = undefined;
        return this.ok.logout();
    }

    get islogin() {
        return this.session && this.session.account_login;
    }

    async info(onlyData = false, fields?:string[]) {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        fields = fields || this.saftKey;
        const data = await Account.findOne({
            where: {
                username: this.session.account_login.username
            }
        });

        data.lastlogin = new Date().valueOf() / 1000;
        data.save();

        if (onlyData == true) return App.filter(data, fields);
        return this.ok.get(App.filter(data, fields));
    }

    async avatar(username:string) {
        const data = await Account.findOne({
            where: {
                username
            },
            attributes: ['avatar']
        });

        let avatar = path.join(process.cwd(), '/public/res/user.png');

        if (data && data.avatar)
            avatar = path.join(process.cwd(), config.file.upload, data.avatar);

        const buffer = fs.readFileSync(avatar);
        return buffer;
    }

    async query(query:any, fields?:string[], onlyData = false) {
        const ops = {
            id: App.ops.in,
            username: App.ops.in,
        };
        query = App.filter(query, Object.keys(ops));
        try {
            const data:any = {
                index: 0,
                count: -1,
                query
            };
            data.fields = fields || this.saftKey.filter(k => ['email', 'phone'].indexOf(k) < 0);
            const queryData = await super.querys(
                data, Account, ops
            );
            if (onlyData) return queryData;
            return this.ok.query(queryData);
        } catch (err) {
            throw (err);
        }
    }

    async sendverify(data:any) {
        const keys = ['username', 'email'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }
        try {
            const account = await this.info(true);
            if (account.username != data.username) {
                throw this.error.limited;
            }

            const sha256 = crypto.createHash('sha256');
            const token = sha256.update(data.email + new Date().getTime() + __salt).digest('hex');

            // clear history token
            await Token.destroy({
                where: {
                    username: data.username
                }
            });

            await super.new({ username: data.username, token }, Token, 'username');

            const transporter = nodemailer.createTransport(config.mail);

            const info = await transporter.sendMail({
                from: `"${config.base.name}" <${config.mail.auth.user}>`, // sender address
                to: data.email,
                subject: `[${config.base.name}] Please verify your email address`, // Subject line
                html: this.__makemail({ ...account, token, domain: config.base.domain }, 'verify'), // html body
            });

            return this.ok.send(info);
        } catch (err) {
            throw (err);
        }

    }
    async verify(data:any) {
        const keys = ['username', 'token'];

        if (!App.haskeys(data, keys)) {
            throw (this.error.param);
        }

        try {
            const token = await Token.findOne({
                where: {
                    username: data.username,
                    token: data.token
                }
            })

            const yesterday = new Date();
            const yesterdayTime = yesterday.setDate(yesterday.getDate() - 1) / 1000;
            if (!token || token.create_time < yesterdayTime) {
                throw (this.error.notverify)
            }

            const account = await Account.findOne({
                where: { username: data.username }
            })
            account.verify = true;
            await account.save();

            await Token.destroy({
                where: {
                    username: data.username
                }
            });

            return this.ok.verify(data.username);
        } catch (err) {
            throw (err);
        }
    }

    get user() {
        if (!this.islogin) {
            throw (this.error.nologin);
        }
        return this.session.account_login;
    }

    __makemail(data:any, type:string) {
        let tpl = '';
        if (!__tpl[type].data) {
            __tpl[type].data = fs.readFileSync(__tpl[type].path).toString();
        }
        tpl = __tpl[type].data;

        Object.keys(data).forEach(k => {
            const value = data[k];
            tpl = tpl.replace(new RegExp(`{{${k}}}`, 'g'), value);
        })
        return tpl;
    }
}

module.exports = Module;