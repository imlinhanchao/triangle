import * as path from 'path';
import * as fs from 'fs';
import App from './app';
const files = require('../lib/files');

const filecfg = require('../config').file;

const __error__ = Object.assign({
  toobig: App.error.reg('上传文件过大！'),
}, App.error);

class Module extends App {
    session: any;
    constructor(session:any) {
        super({ upload: '上传成功' });
        this.session = session;
    }

    get error() {
        return __error__;
    }
    
    async upload(req:any) {
        try {
            const dirpath = path.join(process.cwd(), filecfg.upload);
            files.mkdir(dirpath);
            const filenames = [];
            for (let i = 0; i < req.files.length; i++) {
                if (req.files[i].size > filecfg.maxSize * 1024 * 1024) {
                    throw(this.error.toobig);
                }
                const data = req.files[i].buffer;
                const hash = files.hash(data);
                const filename = hash + path.extname(req.files[i].originalname);
                const savepath = path.join(dirpath, filename);
                if (!files.exists(savepath))
                    fs.writeFileSync(savepath, data);
                filenames.push(filename);
            }
            return this.ok.upload(filenames);
        } catch (error) {
            console.error(error);
        }
    }
}

export default Module;