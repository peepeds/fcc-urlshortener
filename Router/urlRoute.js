const {addUrl,getUrl} = require('../controller/urlController');
const router = require('express').Router();


router.post('/shorturl', addUrl);
router.get('/shorturl/:short_url', getUrl);



module.exports = router;