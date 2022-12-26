import { defineStore } from 'pinia';
import { IAccount, ILogin, IRegister } from 'src/api/models/account';
import { getCurrentUser, login, logout, register } from 'src/api/modules/account';

export const useAccountStore = defineStore('account', {
  state: () => ({
    user: null as IAccount | null,
  }),
  getters: {
  },
  actions: {
    async getInfo() {
      try {
        const rsp = await getCurrentUser();
        if (rsp.state) throw(new Error(rsp.msg))
        this.user = rsp.data;
      } catch (error: any) {
        console.log('get account error: ', error.message);
        return error;
      }
    },
    async login(account: ILogin) {
      try {
        const rsp = await login(account);
        if (rsp.state) throw(new Error(rsp.msg))
        this.user = rsp.data;
      } catch (error: any) {
        return error;
      }
    },
    async register(account: IRegister) {
      try {
        const rsp = await register(account);
        if (rsp.state) throw(new Error(rsp.msg))
        this.user = rsp.data;
      } catch (error: any) {
        return error;
      }
    },
    async logout() {
      await logout();
      this.user = null;
    }
  },
});
