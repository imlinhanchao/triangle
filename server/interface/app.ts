import db, { dbModel } from '../model/db';

interface IDBQuery { 
    where: any, 
    order: any[], 
    attributes?:any[], 
    offset?:number, 
    limit?:number 
}

export class AppError extends Error {

    state: number;
    msg: string;
    data: any;
    isdefine: boolean;

    constructor(state:number, message:string, data?:any) {
        super(message);
        this.state = state;
        this.msg = message;
        this.data = data;
        this.stack = process.env.NODE_ENV === 'development' ? this.stack : undefined;
        this.isdefine = true;
    }

    toString() {
        return {
            state: this.state,
            msg: this.message,
            data: this.data || '',
        };
    }
    
    toJSON() {
        return {
            state: this.state,
            msg: this.message,
            data: this.data || '',
        };
    }
}

class App {
    name: string;
    ok: { 
        [key:string]: (data?:any) => {
            state: number;
            msg: string;
            data?: any;
        } 
    } = {};
    
    constructor(rsps:{ [key:string]: string } = {}) {
        this.name = '';
        const ok = Object.assign(rsps, { 
            query: '查询成功' ,
            create: '创建成功',
            update: '更新成功',
            delete: '删除成功', 
        });
        Object.keys(ok).forEach(o => {
            this.ok[o] = (data:any) => App.ok(ok[o], data, true);
        })
    }

    // async ok(type:string, data:any) {
    //     return App.ok(this.oks[type], data, true)
    // }

    // 通用统计接口
    async count(data: any, Model:dbModel, ops:any, field='id') {
        let keys = Model.keys || [];

        keys = ['id'].concat(keys).concat(['create_time', 'update_time']);
        
        data = data || {};
        
        // 生成查询条件
        const q:any = { where: {} };
        data = App.filter(data, keys);
        q.where = App.where(data, ops);
        q.group = field;

        let total:any = 0;
        try {
            q.attributes = [[db.fn('COUNT', db.col(field)), 'count'], field];
            total = await Model.findAll(q); // 获取总数
            return total;
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (App.error.db(err));
        }
    }

    // 通用查询接口
    async querys(data: any, Model:dbModel, ops:any) {
        let keys = Model.keys || [];

        keys = ['id'].concat(keys).concat(['create_time', 'update_time']);
        
        if (!App.haskeys(data, ['index', 'count'])) {
            throw (App.error.param);
        }

        data.query = data.query || {};
        
        // 生成查询条件
        const q:IDBQuery = { where: {}, order: [] };
        data.query = App.filter(data.query, keys);
        q.where = App.where(data.query, ops);

        // 生成排序，默认以创建时间降序
        data.order = data.order || [];
        if (!data.order.find((o: string | string[]) => o == 'create_time' || o[0] == 'create_time'))
            data.order.push(['create_time', 'DESC']);
        q.order = App.order(data.order, keys);

        let datalist = [], total = 0;
        try {
            q.attributes = [[db.fn('COUNT', db.col('id')), 'total']];
            total = (await Model.findOne(q)).dataValues.total; // 获取总数

            q.attributes = undefined;

            q.offset = parseInt(data.index) || 0;
            if (data.count > 0) q.limit = parseInt(data.count);

            datalist = await Model.findAll(q);
            const fields = data.fields || keys;

            datalist = datalist.map(d => App.filter(d, fields));
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (App.error.db(err));
        }
        return {
            data: datalist,
            total: total
        };
    }

    // 通用新增接口
    async new(data: any, Model:dbModel, unique?: string | string[]) {
        let keys = Model.keys || [];
        
        if (!App.haskeys(data, keys)) {
            throw (App.error.param);
        }

        data = App.filter(data, keys);

        try {
            if (unique) {
                const where:any = {};
                if (typeof unique === 'string') where[unique] = data[unique];
                else if (unique instanceof Array) unique.forEach(u => where[u] = data[u]);
                const record = await Model.findOne({
                    where: where
                });

                if (record) {
                    throw (App.error.existed(this.name));
                }
            }

            data.id = undefined;
            const record = await Model.create(data);

            keys = ['id'].concat(keys).concat(['create_time', 'update_time']);
            return App.filter(record, keys);
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (App.error.db(err));
        }
    }

    // 通用更新接口
    async set(data: any, Model:dbModel, preUpdate:null | ((data:any)=>any) = null, unique = 'id') {
        let keys = Model.keys || [];
        keys = ['id'].concat(keys).concat(['create_time', 'update_time']);

        if (!App.haskeys(data, [unique])) {
            throw (App.error.param);
        }
        
        data = App.filter(data, keys);

        try {
            const where:any = {};
            where[unique] = data[unique];
            let record = await Model.findOne({
                where: where
            });

            if (!record) {
                throw (App.error.existed(this.name, false));
            }

            if (!preUpdate || preUpdate(record)) {
                data[unique] = undefined;
                record = App.update(record, data, keys);
                await record.save();

                return App.filter(record, keys);
            } else {
                throw App.error.limited;
            }
        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (App.error.db(err));
        }
    }

    // 通用删除接口
    async del(data: any, Model:dbModel, preDelete:null | ((data:any)=>any) = null, unique = 'id') {
        const keys = [unique];

        if (!App.haskeys(data, keys)) {
            throw (App.error.param);
        }
        
        data = App.filter(data, keys);

        try {
            const where:any = {};
            where[unique] = data[unique];
            const record = await Model.findOne({
                where: where
            });

            if (!record) {
                throw (App.error.existed(this.name, false));
            }

            if (!preDelete || preDelete(record)) {
                await record.destroy();
                return record;
            } else {
                throw App.error.limited;
            }

        } catch (err:any) {
            if (err.isdefine) throw (err);
            throw (App.error.db(err));
        }
    }

    // 过滤对象数据
    static filter(data: { [key: string]: any }, keys: string[], defaultValue?:any) {
        const d: { [key: string]: any } = {};
        if (!data) return d;
        for (let i = 0; i < keys.length; i++) {
            if (undefined == data[keys[i]]) {
                if (defaultValue !== undefined) data[keys[i]] = defaultValue;
                continue;
            }
            d[keys[i]] = data[keys[i]];
            if (d[keys[i]].replace)
                d[keys[i]] = d[keys[i]].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
        return d;
    }

    // 检查对象数据，包含检查
    static haskeys(data: { [key: string]: any }, keys: string[]) {
        if (!data) return false;
        for (let i = 0; i < keys.length; i++) {
            if (undefined == data[keys[i]]) 
                return false;
        }
        return true;
    }

    // 检查对象数据，至少包含检查
    static hasone(data: { [key: string]: any }, keys: string[]) {
        if (!data) return false;
        for (let i = 0; i < keys.length; i++) {
            if (undefined !== data[keys[i]]) 
                return true;
        }
        return false;
    }

    // 检查对象数据，仅包含检查
    static onlykeys(data: { [key: string]: any }, keys: string[]) {
        if (!data) return false;
        for (const key in data) {
            if (keys.indexOf(key) < 0) return false;
        }
        return true;
    }

    static isSame(
        data1: { [key: string]: any }, 
        data2: { [key: string]: any }, 
        keys: string[] | null = null
    ) {
        if (keys == null) {
            keys = Array.from(new Set(Object.keys(data1).concat(Object.keys(data2))));
        }

        return keys.find(k => data1[k] != data2[k]) == null;
    }

    // 更新数据到对象
    static update(
        oldData: { [key: string]: any }, 
        newData: { [key: string]: any }, 
        keys: string[], 
        isCreate=false) {
        if (!oldData || !newData) throw this.error.param;
        for (let i = 0; i < keys.length; i++) {
            if (!isCreate && oldData[keys[i]] == undefined) continue;
            if (undefined == newData[keys[i]]) continue;
            oldData[keys[i]] = newData[keys[i]];
            if (oldData[keys[i]].replace)
                oldData[keys[i]] = oldData[keys[i]].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
        return oldData;
    }

    static where(query:any, ops:any) {
        Object.keys(ops).forEach((key) => {
            if (!query[key] || query[key].op) return;
            query[key] = {
                op: ops[key],
                val: query[key]
            };
        });

        const where:{ [key:string] : { [key:symbol]: any } } = {};
        for (const k in query) {
            if ('' === query[k])
                continue;
            where[k] = this.op(query[k]);
        }
        return where;
    }

    static order(order:{[key:string]: string | [string, string] }, keys:string[]) {
        const orders = [];
        for (const k in order) {
            let orderField = order[k];
            let OrderType = 'ASC';
            if (orderField instanceof Array
             && orderField.length == 2
             && ['ASC', 'DESC'].indexOf(orderField[1]) >= 0
            ) {
                OrderType = orderField[1];
                orderField = orderField[0];
            }
            else if (typeof orderField == 'string' && keys.indexOf(orderField) < 0) continue;
            orders.push([orderField, OrderType]);
        }
        return orders;
    }

    static get ops() {
        return {
            equal: '=',
            notEqual: '!=',
            less: '<',
            lessOrEqual: '<=',
            greater: '>',
            greaterOrEqual: '>=',
            notLike: '!$',
            like: '$',
            between: '<>',
            notBetween: '!<>',
            in: '~',
        };
    }

    static op(data:{ op:string, val: any }) {
        const ops: { [key:string]: symbol } = {
            '<=': db.Op.lte,
            '>=': db.Op.gte,
            '!=': db.Op.ne,
            '!$': db.Op.notLike,
            '=': db.Op.eq,
            '<': db.Op.lt,
            '>': db.Op.gt,
            '$': db.Op.like,
            '<>': db.Op.between,
            '!<>': db.Op.notBetween,
            '~': db.Op.in
        };

        let operator = db.Op.eq;
        let val = '';
        if (data.op && ops[data.op]) {
            operator = ops[data.op];
            val = data.val;
        }

        const op:{ [key:symbol]: any } = {};
        op[operator] = val;
        return op;
    }

    static res(data:any, msg = '') {
        return {
            state: 0,
            msg: msg,
            data: data
        };
    }

    static ok(action:string, data?:any, customizeTip = false) {
        return {
            state: 0,
            msg: action + (customizeTip ? '' : '成功！'),
            data: data
        };
    }

    static err(err:AppError) {
        if (err.isdefine) {
            return err;
        } else {
            return this.error.server(err.message, err.stack);
        }
    }

    static get error() {
        return {
            __count: 9,
            init: function (errorCode:number) {
                this.__count = errorCode;
            },
            reg: function (msg:string, fn: null | ((data:any) => void) = null) {
                const errorCode = this.__count++;
                if (fn) {
                    return function (data:any) {
                        return new AppError(
                            errorCode,
                            msg,
                            fn(data)
                        );
                    };
                } else {
                    return new AppError(
                        errorCode,
                        msg
                    );
                }
            },
            existed: function (obj:string, exist = true, customizeTip = false) {
                return new AppError(
                    1,
                    obj + (customizeTip ? '' : (exist ? '已存在！' : '不存在！'))
                );
            },
            param: new AppError(2, '接口参数错误！'),
            query: new AppError(3, '无效查询条件！'),
            db: function (err:string) {
                return new AppError(
                    4,
                    '数据库错误：' + err
                );
            },
            network: function (err:string) {
                return new AppError(
                    5,
                    '网络错误：' + err
                );
            },
            limited: new AppError(
                6,
                '权限不足'
            ),
            unauthorized: new AppError(
                7,
                '越权请求'
            ),
            nologin: new AppError(
                8,
                '你没有登录或登录信息已过期！'
            ),
            server: function (err:string, stack?:string) {
                if (err) console.warn(err);
                if (stack) console.warn(stack);
                return new AppError(
                    -1,
                    '服务器错误！' + (err ? err : '')
                );
            },
        };
    }
}


export default App;