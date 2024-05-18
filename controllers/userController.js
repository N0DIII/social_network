const fs = require('fs');
const User = require('../models/User');

class userController {
    async getUserData(req, res) {
        try {
            const { id, myId } = req.body;

            const user = await User.findOne({_id: id}, {_id: 0, username: 1, birthday: 1, sex: 1, albums: 1, posts: 1});
            if(!user || user.delete) return res.json({ error: true, message: 'Пользователь не найден' });

            let friendStatus = 3;
            let friend = await User.findOne({_id: id, friends: myId}, {_id: 1});

            if(friend == null) {
                friend = await User.findOne({_id: id, friend_requests: myId}, {_id: 1});
                if(friend != null) friendStatus = 1;
                else {
                    friend = await User.findOne({_id: myId, friend_requests: id}, {_id: 1});
                    if(friend != null) friendStatus = 2;
                    else friendStatus = 0;
                }
            }

            return res.json({ error: false, user, friendStatus});
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Пользователь не найден' });
        }
    }

    async changeUserData(req, res) {
        try {
            const { id, avatar, username, sex, birthday } = req.body;

            if(username && username.trim() == '') return res.json({field: 0, message: 'Имя пользователя не может быть пустым'});
            if(username.length > 20) return res.json({field: 0, message: 'Имя пользователя не может быть длиннее 20 символов'});

            if(username) await User.updateOne({_id: id}, {$set: {username}});
            if(sex != '') await User.updateOne({_id: id}, {$set: {sex}});
            if(birthday.length != 0) await User.updateOne({_id: id}, {$set: {birthday}});

            if(avatar != undefined) {
                let buff = new Buffer.from(avatar.split(',')[1], 'base64').toString('binary');
                fs.writeFile(`./public/users/${id}/avatar.png`, buff, 'binary', e => {
                    if(e) {
                        console.log(e);
                        res.json({ error: true, message: 'Произошла ошибка при изменении аватара' });
                    }
                    else {
                        res.json({ error: false });
                    }
                })
            }
            else {
                res.json({ error: false });
            }
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при изменении данных' });
        }
    }

    async getItems(req, res) {
        try {
            const { id, count, search, type } = req.body;

            if(type == 'friends') {
                const friends = await User.find({_id: {$ne: id}, friends: id, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).skip(count * 10).limit(10);
                const maxCount = await User.find({_id: {$ne: id}, friends: id, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).countDocuments();
                res.json({ error: false, items: friends, maxCount });
            }
            else if(type == 'requests') {
                const me = await User.findOne({_id: id}, {friend_requests: 1});
                const requests = await User.find({_id: {$in: me.friend_requests}, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).skip(count * 10).limit(10);
                const maxCount = await User.find({_id: {$in: me.friend_requests}, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).countDocuments();
                res.json({ error: false, items: requests, maxCount });
            }
            else if(type == 'users') {
                const users = await User.find({_id: {$ne: id}, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).skip(count * 10).limit(10);
                const maxCount = await User.find({_id: {$ne: id}, username: {$regex: search}, $or: [{delete: {$exists: false}}, {delete: false}]}, {_id: 1, username: 1, online: 1}).countDocuments();
                res.json({ error: false, items: users, maxCount });
            }
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении пользователей' });
        }
    }

    async addFriend(req, res) {
        try {
            const { id, myId } = req.body;

            const alreadyReq = await User.findOne({ _id: myId, friend_requests: id });
            if(alreadyReq != null) return res.json({ error: false, status: 2 });

            await User.updateOne({_id: id}, {$push: {friend_requests: myId}});

            res.json({ error: false, status: 1 });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при отправке запроса' });
        }
    }

    async acceptFriend(req, res) {
        try {
            const { id, myId } = req.body;

            await User.updateOne({_id: myId}, {$pull: {friend_requests: id}});
            await User.updateOne({_id: myId}, {$push: {friends: id}});
            await User.updateOne({_id: id}, {$push: {friends: myId}});

            res.json({ error: false, status: 3 });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при принятии запроса' });
        }
    }

    async deleteFriend(req, res) {
        try {
            const { id, myId } = req.body;

            await User.updateOne({_id: myId}, {$pull: {friends: id}});
            await User.updateOne({_id: id}, {$pull: {friends: myId}});

            res.json({ error: false, status: 0 });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при удалении из друзей' });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.body;

            await User.updateOne({ _id: id }, { $set: { delete: true, online: false } });
            fs.copyFileSync('./src/deleteAvatar.png', `./public/users/${id}/avatar.png`);

            res.json({ error: false });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при удалении аккаунта' });
        }
    }
}

module.exports = new userController();