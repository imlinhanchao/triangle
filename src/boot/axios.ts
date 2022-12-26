import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { config } from 'src/utils'
import { Cookies } from 'quasar'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: process.env.SERVER ? `http://127.0.0.1:${config.port}/api` : '/api' });

export default boot(({ app, ssrContext }) => {
  if (ssrContext) {
    const cookies = process.env.SERVER
    ? Cookies.parseSSR(ssrContext).getAll()
    : Cookies.getAll();
    
    const cookiesSet = Object.keys(cookies).
      reduce((prev, curr) => prev + curr + '=' + cookies[curr] + ';', '');
    api.defaults.headers.common.Cookie = cookiesSet;
    api.defaults.withCredentials = true
  }
  
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
