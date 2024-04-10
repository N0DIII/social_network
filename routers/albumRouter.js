const Router = require('express');
const router = new Router();
const controller = require('../controllers/albumController');

router.post('/addAlbum', controller.addAlbum);
router.post('/deleteAlbum', controller.deleteAlbum);
router.post('/changeAlbumName', controller.changeAlbumName);
router.post('/getAlbums', controller.getAlbums);
router.post('/getAlbum', controller.getAlbum);
router.post('/getPhotos', controller.getPhotos);
router.post('/loadPhoto', controller.uploadFile.single('file'), controller.loadPhoto);
router.post('/deletePhoto', controller.deletePhoto);

module.exports = router;