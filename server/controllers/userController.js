const fs = require('fs');
const User = require('../models/User');

class userController {
    async getUserData(req, res) {
        try {
            const { id, myId } = req.body;

            const user = await User.findOne({_id: id}, {_id: 0, username: 1, birthday: 1, sex: 1, albums: 1, posts: 1});
            if(!user) return res.json({message: 'Пользователь не найден'});

            let isFriend = 3;
            let friend = await User.findOne({_id: id, friends: myId}, {_id: 1});

            if(friend == null) {
                friend = await User.findOne({_id: id, friend_requests: myId}, {_id: 1});
                if(friend != null) isFriend = 1;
                else {
                    friend = await User.findOne({_id: myId, friend_requests: id}, {_id: 1});
                    if(friend != null) isFriend = 2;
                    else isFriend = 0;
                }
            }

            return res.json({user, isFriend});
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async changeUserData(req, res) {
        try {
            const { id, avatar, username, sex, birthday } = req.body;

            if(username.length == 0) return res.json({field: 0, message: 'Имя пользователя не может быть пустым'});
            if(username.length > 20) return res.json({field: 0, message: 'Имя пользователя не может быть длиннее 20 символов'});

            if(username) await User.updateOne({_id: id}, {$set: {username}});
            await User.updateOne({_id: id}, {$set: {sex}});
            if(birthday.length != 0) await User.updateOne({_id: id}, {$set: {birthday}});

            if(avatar != undefined) {
                let buff = new Buffer.from(avatar.split(',')[1], 'base64').toString('binary');
                fs.writeFile(`./public/users/${id}/avatar.png`, buff, 'binary', e => {if(e) console.log(e)});
            }

            res.json(true);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getUsers(req, res) {
        try {
            const { id, count, search } = req.body;

            const users = await User.find({_id: {$ne: id}, friends: {$nin: id}, username: {$regex: search}}, {_id: 1, username: 1}).skip(count * 10).limit(10);

            res.json(users);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getFriends(req, res) {
        try {
            const { id, search } = req.body;

            const friends = await User.find({_id: {$ne: id}, friends: id, username: {$regex: search}}, {_id: 1, username: 1});

            res.json(friends);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async addFriend(req, res) {
        try {
            const { id, myId } = req.body;

            await User.updateOne({_id: id}, {$push: {friend_requests: myId}});

            res.json({ status: 1 });
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async acceptFriend(req, res) {
        try {
            const { id, myId } = req.body;

            await User.updateOne({_id: myId}, {$pull: {friend_requests: id}});
            await User.updateOne({_id: myId}, {$push: {friends: id}});
            await User.updateOne({_id: id}, {$push: {friends: myId}});

            res.json({ status: 3 });
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async deleteFriend(req, res) {
        try {
            const { id, myId } = req.body;

            await User.updateOne({_id: myId}, {$pull: {friends: id}});
            await User.updateOne({_id: id}, {$pull: {friends: myId}});

            res.json({ status: 0 });
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }
}

module.exports = new userController();