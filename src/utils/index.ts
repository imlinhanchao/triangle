import cfg from '../../config.json';
import { Notify, QNotifyCreateOptions } from 'quasar'
import { useAccountStore } from 'src/stores/account';
import pkg_json from '../../package.json'

export const config = cfg;
export const pkg = pkg_json;

export function notify(options: QNotifyCreateOptions | string) {
    return Notify.create(options);
}

export function preFetch() {
    const accountStore = useAccountStore();
    return accountStore.getInfo();
}
