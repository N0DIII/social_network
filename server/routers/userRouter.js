const Router = require('express');
const router = new Router();
const controller = require('../controllers/userController');

router.post('/getUserData', controller.getUserData);
router.post('/changeUserData', controller.changeUserData);
router.post('/getUsers', controller.getUsers);
router.post('/getFriends', controller.getFriends);
router.post('/deleteFriend', controller.deleteFriend);
router.post('/addFriend', controller.addFriend);
router.post('/acceptFriend', controller.acceptFriend);

module.exports = router;