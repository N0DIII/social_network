const Router = require('express');
const router = new Router();
const controller = require('../controllers/groupController');

router.post('/getCategories', controller.getCategories);
router.post('/createGroup', controller.createGroup);
router.post('/getGroups', controller.getGroups);
router.post('/getGroup', controller.getGroup);
router.post('/joinGroup', controller.joinGroup);
router.post('/leaveGroup', controller.leaveGroup);
router.post('/deleteGroup', controller.deleteGroup);
router.post('/editGroup', controller.editGroup);
router.post('/getMembers', controller.getMembers);
router.post('/changeStatus', controller.changeStatus);
router.post('/changeAvatar', controller.upload.single('file'), controller.changeAvatar);

module.exports = router;
