const Router = require('express');
const router = new Router();
const controller = require('../controllers/postController');

router.post('/addPost', controller.upload.any('file'), controller.addPost);
router.post('/editPost', controller.upload.any('file'), controller.editPost);
router.post('/getPosts', controller.getPosts);
router.post('/deletePost', controller.deletePost);
router.post('/addLike', controller.addLike);
router.post('/deleteLike', controller.deleteLike);
router.post('/sendComment', controller.sendComment);
router.post('/getComments', controller.getComments);
router.post('/sendImage', controller.uploadImage.single('file'), controller.sendImage);
router.post('/sendVideo', controller.uploadVideo.single('file'), controller.sendVideo);
router.post('/sendFile', controller.uploadFile.single('file'), controller.sendFile);
router.post('/deleteComment', controller.deleteComment);
router.post('/editComment', controller.editComment);

module.exports = router;