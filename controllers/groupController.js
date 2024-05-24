const User = require('../models/User');
const Group = require('../models/Group');
const GroupCategories = require('../models/GroupCategories');
const fs = require('fs');
const str_rand = require('../str_rand');

class groupController {
    async getCategories(req, res) {
        const categories = await GroupCategories.find();
        res.json(categories);
    }

    async createGroup(req, res) {
        try {
            const { avatar, name, categories, description, creator } = req.body;

            if(name.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
            if(name.length > 30) return res.json({ error: true, message: 'Название не может быть длиннее 30 символов' });

            const isGroup = await Group.findOne({ name }, { _id: 1 });
            if(isGroup != null) return res.json({ error: true, message: 'Сообщество с таким названием уже существует' });

            const avatarName = str_rand(10);
            const group = new Group({ name, categories, description, creator, admins: [creator], created: new Date(), avatar: avatarName });
            await fs.mkdirSync(`./public/groups/${group._id}`);

            if(avatar != undefined) {
                let buff = new Buffer.from(avatar.split(',')[1], 'base64').toString('binary');
                fs.writeFileSync(`./public/groups/${group._id}/avatar_${avatarName}.png`, buff, 'binary');
            }
            else {
                fs.copyFileSync('./src/defaultGroup.png', `./public/groups/${group._id}/avatar_${avatarName}.png`);
            }

            await group.save();
            await User.updateOne({ _id: creator }, { $push: { groups: group._id } });
            res.json({ error: false, group });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при создании группы' });
        }
    }

    async getGroups(req, res) {
        const { count, search, category, type, user } = req.body;

        let groups = [];
        let maxCount = 0;

        if(category != '') {
            if(type == 'subscribe') {
                const userGroups = await User.find({ _id: user }, { groups: 1 });
                groups = await Group.find({ _id: userGroups.groups, name: { $regex: search }, categories: category }).skip(count * 10).limit(10);
                maxCount = await Group.find({ _id: userGroups.groups, name: { $regex: search }, categories: category }).countDocuments();
            }
            else if(type == 'own') {
                groups = await Group.find({ name: { $regex: search }, categories: category, creator: user }).skip(count * 10).limit(10);
                maxCount = await Group.find({ name: { $regex: search }, categories: category, creator: user }).countDocuments();
            }
            else if(type == 'all') {
                groups = await Group.find({ name: { $regex: search }, categories: category }).skip(count * 10).limit(10);
                maxCount = await Group.find({ name: { $regex: search }, categories: category }).countDocuments();
            }
        }
        else {
            if(type == 'subscribe') {
                const userGroups = await User.findOne({ _id: user }, { groups: 1 });
                groups = await Group.find({ _id: userGroups.groups, name: { $regex: search } }).skip(count * 10).limit(10);
                maxCount = await Group.find({ _id: userGroups.groups, name: { $regex: search } }).countDocuments();
            }
            else if(type == 'own') {
                groups = await Group.find({ name: { $regex: search }, creator: user }).skip(count * 10).limit(10);
                maxCount = await Group.find({ name: { $regex: search }, creator: user }).countDocuments();
            }
            else if(type == 'all') {
                groups = await Group.find({ name: { $regex: search } }).skip(count * 10).limit(10);
                maxCount = await Group.find({ name: { $regex: search } }).countDocuments();
            }
        }

        res.json({ groups, maxCount });
    }

    async getGroup(req, res) {
        try {
            const { id, userID } = req.body;

            let group = await Group.findOne({ _id: id });
            const user = await User.findOne({ _id: userID }, { groups: 1 });
            group = { ...group._doc, member: user.groups.includes(id) };

            res.json(group);
        }
        catch(e) {
            res.json(false);
        }
    }

    async joinGroup(req, res) {
        try {
            const { groupID, userID } = req.body;

            await User.updateOne({ _id: userID }, { $push: { groups: groupID } });
            await Group.updateOne({ _id: groupID }, { $inc: { users: 1 }});

            res.json({ error: false });
        }
        catch(e) {
            res.json({ error: true, message: 'Произошла ошибка при присоединении к сообществу' })
        }
    }

    async leaveGroup(req, res) {
        try {
            const { groupID, userID } = req.body;

            await User.updateOne({ _id: userID }, { $pull: { groups: groupID } });
            await Group.updateOne({ _id: groupID }, { $inc: { users: -1 }});

            res.json({ error: false });
        }
        catch(e) {
            res.json({ error: true, message: 'Произошла ошибка при выходе из сообщества' });
        }
    }

    async deleteGroup(req, res) {
        try {
            const { groupID } = req.body;

            fs.rm(`./public/groups/${groupID}`, { recursive: true }, async e => {
                if(e) {
                    console.log(e);
                    return res.json({ error: true, message: 'Произошла ошибка при удалении сообщества' });
                }
                else {
                    await User.updateMany({ groups: groupID }, { $pull: { groups: groupID } });
                    await Group.deleteOne({ _id: groupID });
                    res.json({ error: false });
                }
            })
        }
        catch(e) {
            res.json({ error: true, message: 'Произошла ошибка при удалении сообщества' });
        }
    }

    async editGroup(req, res) {
        try {
            const { id, avatar, name, description, categories } = req.body;

            if(name.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
            if(name.length > 30) return res.json({ error: true, message: 'Название не может быть длиннее 30 символов' });

            const isGroup = await Group.findOne({ name }, { _id: 1 });
            if(isGroup != null && isGroup._id != id) return res.json({ error: true, message: 'Сообщество с таким названием уже существует' });

            await Group.updateOne({ _id: id }, { $set: { name, description, categories } });

            if(avatar != undefined) {
                const name = str_rand(10);
                let buff = new Buffer.from(avatar.split(',')[1], 'base64').toString('binary');
                fs.writeFileSync(`./public/groups/${id}/avatar_${name}.png`, buff, 'binary');
                const oldName = await Group.findOne({ _id: id }, { avatar: 1 });
                fs.unlinkSync(`./public/groups/${id}/avatar_${oldName.avatar}.png`);
                await Group.updateOne({ _id: id }, { $set: { avatar: name } });
            }

            res.json({ error: false });
        }
        catch(e) {
            console.log(e)
            res.json({ error: true, message: 'Произошла ошибка при изменении группы' });
        }
    }

    async getMembers(req, res) {
        const { id } = req.body;

        const group = await Group.findOne({ _id: id }, { creator: 1, admins: 1 });
        let members = await User.find({ groups: id, _id: { $ne: group.creator } });

        for(let i = 0; i < members.length; i++) {
            if(group.admins.includes(members[i]._id)) members[i] = { ...members[i]._doc, status: 'admin' };
            else members[i] = { ...members[i]._doc, status: 'member' };
        }

        res.json(members);
    }

    async changeStatus(req, res) {
        const { user, group, value } = req.body;

        if(value == 'admin') await Group.updateOne({ _id: group }, { $addToSet: { admins: user } });
        else if(value == 'member') await Group.updateOne({ _id: group }, { $pull: { admins: user } });

        res.json({ error: false });
    }
}

module.exports = new groupController();