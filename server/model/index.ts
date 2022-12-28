import * as db from './db';


const orms = import.meta.globEager('./orms/**');
const modules:any = {};
Object.keys(orms).forEach((key) => {
  const k = key.replace(/(\.\/modules\/|\.js|\.ts)/g, '');
  modules[k] = orms[key].default || {};
});

export default modules;

export const sync = () => {
    return db.sync();
};