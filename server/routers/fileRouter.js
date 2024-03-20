const Router = require('express');
const router = new Router();
const controller = require('../controllers/fileController');

router.post('/addAlbum', controller.addAlbum);
router.post('/deleteAlbum', controller.deleteAlbum);
router.post('/changeAlbumName', controller.changeAlbumName);
router.post('/getAlbums', controller.getAlbums);
router.post('/getAlbum', controller.getAlbum);
router.post('/loadPhoto', controller.loadPhoto);
router.post('/deletePhoto', controller.deletePhoto);

module.exports = router;