const Router = require('express');
const router = new Router();
const controller = require('../controllers/chatController');

router.post('/getChats', controller.getChats);
router.post('/getChat', controller.getChat);
router.post('/sendImage', controller.uploadImage.single('file'), controller.sendImage);
router.post('/sendVideo', controller.uploadVideo.single('file'), controller.sendVideo);
router.post('/sendFile', controller.uploadFile.single('file'), controller.sendFile);
router.post('/getPhoto', controller.getPhoto);
router.post('/getVideo', controller.getVideo);
router.post('/getFile', controller.getFile);
router.post('/deleteChat', controller.deleteChat);
router.post('/editChat', controller.editChat);
router.post('/getMessages', controller.getMessages);
router.post('/getMembers', controller.getMembers);
router.post('/changeAvatar', controller.upload.single('file'), controller.changeAvatar);

module.exports = router;
