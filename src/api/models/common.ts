export interface IBaseResponse<T> {
    state: number;
    data: T;
    msg: string;
}

export type BaseResponseSync<T> = Promise<IBaseResponse<T>>;

export interface BasePageResponse<T> {
    data: T[];
    total: number;
}

export type BasePageResponseSync<T> = Promise<IBaseResponse<BasePageResponse<T>>>;

export interface IQuery {
    index?: number;
    count?: number;
    query?: any
}