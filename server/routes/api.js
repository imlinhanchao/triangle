var express = require('express');
var router = express.Router();
const modules = require('../modules');
let loader = require('./loader');


// add the router in here
router.use(require('./access'));
router.use('/lib', require('./lib'));
router.use('/account', loader(modules.account));
router.use('/snippet', loader(modules.snippet));
router.use('/comment', loader(modules.comment));
router.use('/fav', loader(modules.fav));

router.get('/', function (req, res) {
    res.render('index', { title: 'API' });
});

module.exports = router;
