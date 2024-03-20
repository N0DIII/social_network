const Router = require('express');
const router = new Router();
const controller = require('../controllers/chatController');

router.post('/createChat', controller.createChat);
router.post('/getChats', controller.getChats);

module.exports = router;