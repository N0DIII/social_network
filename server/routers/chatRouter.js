const Router = require('express');
const router = new Router();
const controller = require('../controllers/chatController');

router.post('/createPersonalChat', controller.createPersonalChat);
router.post('/getChats', controller.getChats);
router.post('/getChat', controller.getChat);
router.post('/sendImage', controller.uploadImage.single('file'), controller.sendImage);
router.post('/sendVideo', controller.uploadVideo.single('file'), controller.sendVideo);
router.post('/sendFile', controller.uploadFile.single('file'), controller.sendFile);

module.exports = router;