const Router = require('express');
const router = new Router();
const controller = require('../controllers/userController');

router.post('/getUserData', controller.getUserData);
router.post('/changeUserData', controller.changeUserData);
router.post('/getItems', controller.getItems);
router.post('/deleteFriend', controller.deleteFriend);
router.post('/addFriend', controller.addFriend);
router.post('/acceptFriend', controller.acceptFriend);
router.post('/deleteUser', controller.deleteUser);

module.exports = router;