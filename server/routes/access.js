var express = require('express');
var router = express.Router();
const modules = require('../modules');
const App = modules.app;
const Account = modules.account;
const config = require('../config');

router.all('/:interface/:fn*', function (req, res, next) {
    if (req.hostname == config.base.preview_domain) {
        return res.status(404).send('404 not found');
    }

    // 允许不登录访问的接口，若所有函数都允许，则写为 interface: '*'
    const no_login_interface = {
        account: ['login', 'query', 'exist', 'create', 'exists', 'avatar'],
        lib: ['captcha'],
    };

    let account = new Account(req.session);

    if (!account.islogin
        && (!no_login_interface[req.params.interface]
            || (no_login_interface[req.params.interface] != '*'
                && no_login_interface[req.params.interface].indexOf(req.params.fn) < 0))
    ) {
        return res.json(App.error.nologin);
    }

    next();
});

module.exports = router;