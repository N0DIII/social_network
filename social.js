const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const str_rand = require('./str_rand');
const multer  = require('multer');
require('dotenv').config();
const loadSize = process.env.LOAD_SIZE;

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const Album = require('./models/Album');
const Comment = require('./models/Comment');
const Group = require('./models/Group');
const GroupCategories = require('./models/GroupCategories');
const Like = require('./models/Like');
const Post = require('./models/Post');

const app = express();
const server = createServer(app);

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(express.static('public'));
app.use(express.static('test'));
app.use(express.static('./client/build'));
app.use(express.json());

app.get('*', (req, res) => res.sendFile(__dirname + '/client/build/index.html'));

app.get('/test', (req, res) => res.sendFile(__dirname + '/test/test.html'));

const start = async () => {
    try {
        const dir = ['./public', './uploads', './public/chats', './public/groups', './public/posts', './public/users'];
        for(let i = 0; i < dir.length; i++) {
            if(!fs.existsSync(dir[i])) fs.mkdirSync(dir[i]);
        }

        await mongoose.connect(process.env.MONGODB_URL);
        server.listen(process.env.PORT, () => console.log(`server started on port ${process.env.PORT}`));
    }
    catch(e) {
        console.log(e);
    }
}

start();

/* _____________Файлы_____________ */

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    }
})

const albumFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'image' || file.mimetype.split('/')[0] == 'video') cb(null, true);
    else cb(null, false);
}

const avatarFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'image') cb(null, true);
    else cb(null, false);
}

const albumUpload = multer({ storage: storageConfig, fileFilter: albumFilter });
const avatarUpload = multer({ storage: storageConfig, fileFilter: avatarFilter });
const upload = multer({ storage: storageConfig });

/* _____________Авторизация_____________ */

app.post('/authorization', async (req, res) => {
    try {
        const { token } = req.body;

        const decodedData = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decodedData.id }, { password: 0 });
        if(!user || user.delete) return res.json({ error: true, message: 'Произошла ошибка' });

        res.json(user);
    }
    catch(e) {
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if(!user || user.delete) return res.json({ field: 0, message: `Пользователь ${username} не найден` });

        const validPassword = bcrypt.compareSync(password, user.password);
        if(!validPassword) return res.json({ field: 1, message: 'Введен неверный пароль' });

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '30d' });
        return res.json({ error: false, token });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/registration', avatarUpload.single('file'), async (req, res) => {
    try {
        const { username, password, repeatPassword } = JSON.parse(req.body.json);
        const file = req.file;

        let errors = [];

        if(username.trim() == '') errors.push({ field: 0, message: 'Имя пользователя не может быть пустым' });
        else if(username.length > 40) errors.push({ field: 0, message: 'Имя пользователя не может быть длиннее 40 символов' });
        else {
            const candidate = await User.findOne({ username });
            if(candidate) errors.push({ field: 0, message: 'Пользователь с таким именем уже существует' });
        }
        if(password.length < 5) errors.push({ field: 1, message: 'Пароль должен быть длиннее 4 символов' });
        else if(password.length > 40) errors.push({ field: 1, message: 'Пароль не может быть длиннее 40 символов' });
        if(password != repeatPassword) errors.push({ field: 2, message: 'Пароли не совпадают' });

        if(errors.length != 0) return res.json({ error: true, errors });

        const hashPassword = bcrypt.hashSync(password, 7);
        const avatar = str_rand(10) + '.png';

        const user = new User({ username, password: hashPassword, avatar });
        await user.save();

        fs.mkdirSync(`./public/users/${user._id}`);
        fs.mkdirSync(`./public/users/${user._id}/albums`);
        fs.mkdirSync(`./public/users/${user._id}/avatar`);

        if(file != undefined) fs.renameSync(file.path, `./public/users/${user._id}/avatar/${avatar}`);
        else fs.copyFileSync('./src/defaultAvatar.png', `./public/users/${user._id}/avatar/${avatar}`);

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '30d' });
        return res.json({ error: false, token });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

/* _____________Пользователи_____________ */

app.post('/getUser', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ _id: userId }, { password: 0 });
        if(!user) return res.json({ error: true, message: 'Пользователь не найден' });

        res.json({ error: false, user });
    }
    catch(e) {
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getUsers', async (req, res) => {
    try {
        const { senderId, category, search, count, all = false } = req.body;

        switch(category) {
            case 'friends': {
                if(all) {
                    const users = await User.find({ friends: senderId }, { password: 0 });
                    return res.json({ error: false, users });
                }

                const users = await User.find({ friends: senderId, username: { $regex: search } }, { password: 0 }).skip(count * loadSize).limit(loadSize);
                const maxCount = await User.find({ friends: senderId, username: { $regex: search } }).countDocuments();

                return res.json({ error: false, users, maxCount });
            }

            case 'requests': {
                const sender = await User.findOne({ _id: senderId }, { friend_requests: 1 });
                const users = await User.find({ _id: { $in: sender.friend_requests }, username: { $regex: search } }, { password: 0 }).skip(count * loadSize).limit(loadSize);
                const maxCount = await User.find({ _id: { $in: sender.friend_requests }, username: { $regex: search } }).countDocuments();

                return res.json({ error: false, users, maxCount });
            }

            case 'users': {
                const users = await User.find({ _id: { $ne: senderId }, username: { $regex: search } }, { password: 0 }).skip(count * loadSize).limit(loadSize);
                const maxCount = await User.find({ _id: { $ne: senderId }, username: { $regex: search } }).countDocuments();

                return res.json({ error: false, users, maxCount });
            }
        }
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeUser', avatarUpload.single('file'), async (req, res) => {
    try {
        const { userId, username, sex, birthday, oldAvatar } = JSON.parse(req.body.json);
        const file = req.file;

        if(username != '') {
            if(username.trim() == '') return res.json({ error: true, message: 'Имя пользователя не может быть пустым' });
            if(username.length > 40) return res.json({ error: true, message: 'Имя пользователя не может быть длиннее 40 символов' });

            await User.updateOne({ _id: userId }, { $set: { username } });
        }

        if(sex != '') {
            await User.updateOne({ _id: userId }, { $set: { sex } });
        }

        if(birthday != '') {
            await User.updateOne({ _id: userId }, { $set: { birthday } });
        }

        if(file != undefined) {
            const avatar = str_rand(10) + '.png';
            fs.unlinkSync(`./public/users/${userId}/avatar/${oldAvatar}`);
            fs.renameSync(file.path, `./public/users/${userId}/avatar/${avatar}`);
            await User.updateOne({ _id: userId }, { $set: { avatar } });

            return res.json({ error: false, avatar });
        }

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deleteUser', async (req, res) => {
    try {
        const { userId } = req.body;

        fs.rmSync(`./public/users/${userId}/albums`, { recursive: true });
        const avatar = str_rand(10) + '.png';
        fs.copyFileSync('./src/deleteAvatar.png', `./public/users/${userId}/avatar/${avatar}`);
        await User.updateOne({ _id: userId }, { $set: { delete: true, avatar } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

/* _____________Друзья_____________ */

app.post('/friendRequest', async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        const already = await User.findOne({ _id: senderId, friend_requests: userId });
        if(already != null) return res.json({ error: false, status: 2 });

        await User.updateOne({ _id: userId }, { $push: { friend_requests: senderId } });

        res.json({ error: false, status: 1 });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/friendAccept', async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        await User.updateOne({ _id: senderId }, { $pull: { friend_requests: userId } });
        await User.updateOne({ _id: senderId }, { $push: { friends: userId } });
        await User.updateOne({ _id: userId }, { $push: { friends: senderId } });

        res.json({ error: false, status: 3 });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/friendDelete', async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        await User.updateOne({ _id: senderId }, { $pull: { friends: userId } });
        await User.updateOne({ _id: userId }, { $pull: { friends: senderId } });

        res.json({ error: false, status: 0 });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

/* _____________Альбомы_____________ */

app.post('/createAlbum', async (req, res) => {
    try {
        const { userId, name } = req.body;

        if(name.length > 40) return res.json({ error: true, message: 'Название альбома не может быть длиннее 40 символов' });

        const album = new Album({ name: name == '' ? 'Без названия' : name, user: userId });
        if(!fs.existsSync(`./public/users/${userId}/albums`)) fs.mkdirSync(`./public/users/${userId}/albums`);
        fs.mkdirSync(`./public/users/${userId}/albums/${album._id}`);
        await album.save();

        res.json({ error: false, album });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeAlbum', async (req, res) => {
    try {
        const { albumId, name } = req.body;

        if(name.length > 40) return res.json({ error: true, message: 'Название альбома не может быть длиннее 40 символов' });

        await Album.updateOne({ _id: albumId }, { name: name == '' ? 'Без названия' : name });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deleteAlbum', async (req, res) => {
    try {
        const { userId, albumId } = req.body;

        fs.rmSync(`./public/users/${userId}/albums/${albumId}`, { recursive: true });
        await Album.deleteOne({ _id: albumId });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getAlbum', async (req, res) => {
    try {
        const { albumId } = req.body;

        const album = await Album.findOne({ _id: albumId });

        res.json({ error: false, album });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getAlbums', async (req, res) => {
    try {
        const { userId } = req.body;

        const albums = await Album.find({ user: userId }, { files: { $slice: 1 } }).sort({ $natural: -1 });

        res.json({ error: false, albums });
    }
    catch(e) {
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/loadAlbumFile', albumUpload.any('file'), async (req, res) => {
    try {
        const { albumId, userId } = JSON.parse(req.body.json);
        const files = req.files;

        let loadFiles = [];

        for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];
            const src = str_rand(10) + '.' + files[i].mimetype.split('/')[1];

            fs.renameSync(files[i].path, `./public/users/${userId}/albums/${albumId}/${src}`);
            await Album.updateOne({ _id: albumId }, { $push: { files: { src, mimetype } } });

            loadFiles.push({ src, mimetype });
        }

        res.json({ error: false, files: loadFiles });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deleteAlbumFile', async (req, res) => {
    try {
        const { userId, albumId, src } = req.body;

        fs.unlinkSync(`./public/users/${userId}/albums/${albumId}/${src}`);
        await Album.updateOne({ _id: albumId }, { $pull: { files: { src } } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

/* _____________Группы_____________ */

app.post('/createGroup', avatarUpload.single('file'), async (req, res) => {
    try {
        const { userId, name, category, description } = JSON.parse(req.body.json);
        const file = req.file;

        if(name.trim() == '') return res.json({ error: true, message: 'Название группы не может быть пустым' });
        if(name.length > 40) return res.json({ error: true, message: 'Название группы не может быть длиннее 40 символов' });

        const group = new Group({ name, description, category, creator: userId, created: new Date() });
        fs.mkdirSync(`./public/groups/${group._id}`);
        fs.mkdirSync(`./public/groups/${group._id}/avatar`);

        const avatar = str_rand(10) + '.png';
        if(file != undefined) fs.renameSync(file.path, `./public/groups/${group._id}/avatar/${avatar}`);
        else fs.copyFileSync('./src/defaultGroup.png', `./public/groups/${group._id}/avatar/${avatar}`);

        await group.save();
        await Group.updateOne({ _id: group._id }, { $set: { avatar } });
        await User.updateOne({ _id: userId }, { $push: { groups: group._id } });

        res.json({ error: false, id: group._id });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeGroup', avatarUpload.single('file'), async (req, res) => {
    try {
        const { groupId, name, category, description, oldAvatar } = JSON.parse(req.body.json);
        const file = req.file;

        if(name.trim() == '') return res.json({ error: true, message: 'Название группы не может быть пустым' });
        if(name.length > 40) return res.json({ error: true, message: 'Название группы не может быть длиннее 40 символов' });

        await Group.updateOne({ _id: groupId }, { $set: { name, category, description } });

        if(file != undefined) {
            const avatar = str_rand(10) + '.png';
            fs.unlinkSync(`./public/groups/${groupId}/avatar/${oldAvatar}`);
            fs.renameSync(file.path, `./public/groups/${groupId}/avatar/${avatar}`);
            await Group.updateOne({ _id: groupId }, { $set: { avatar } });

            return res.json({ error: false, avatar });
        }

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deleteGroup', async (req, res) => {
    try {
        const { groupId } = req.body;

        fs.rmSync(`./public/groups/${groupId}`, { recursive: true });
        await Group.deleteOne({ _id: groupId });
        await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getGroup', async (req, res) => {
    try {
        const { groupId } = req.body;

        const group = await Group.findOne({ _id: groupId });

        res.json({ error: false, group });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getGroups', async (req, res) => {
    try {
        const { userId, category, search, count } = req.body;

        switch(category) {
            case 'subscribe': {
                const userGroups = await User.findOne({ _id: userId }, { groups: 1 });
                const groups = await Group.find({ _id: { $in: userGroups }, name: { $regex: search } }).skip(count * loadSize).limit(loadSize);
                const maxCount = await Group.find({ _id: { $in: userGroups }, name: { $regex: search } }).countDocuments();
                return res.json({ error: false, groups, maxCount });
            }

            case 'own': {
                const groups = await Group.find({ creator: userId, name: { $regex: search } }).skip(count * loadSize).limit(loadSize);
                const maxCount = await Group.find({ creator: userId, name: { $regex: search } }).countDocuments();
                return res.json({ error: false, groups, maxCount });
            }

            case 'all': {
                const groups = await Group.find({ name: { $regex: search } }).skip(count * loadSize).limit(loadSize);
                const maxCount = await Group.find({ name: { $regex: search } }).countDocuments();
                return res.json({ error: false, groups, maxCount });
            }
        }
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getGroupCategories', async (req, res) => {
    try {
        const categories = await GroupCategories.find();

        res.json({ error: false, categories });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/joinGroup', async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        await User.updateOne({ _id: userId }, { $push: { groups: groupId } });
        await Group.updateOne({ _id: groupId }, { $inc: { userCount: 1 }});

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/leaveGroup', async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        await User.updateOne({ _id: userId }, { $pull: { groups: groupId } });
        await Group.updateOne({ _id: groupId }, { $inc: { userCount: -1 }});

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getGroupMembers', async (req, res) => {
    try {
        const { groupId } = req.body;

        const users = await User.find({ groups: groupId });
        const admins = await Group.findOne({ _id: groupId }, { admins: 1 });

        const members = users.map(user => { return { ...user._doc, admin: admins.admins.includes(user._id) ? true : false } });

        res.json({ error: false, members });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeMemberStatus', async (req, res) => {
    try {
        const { groupId, userId, status } = req.body;

        if(status == 'admin') await Group.updateOne({ _id: groupId }, { $addToSet: { admins: userId } });
        else if(status == 'member') await Group.updateOne({ _id: groupId }, { $pull: { admins: userId } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

/* _____________Посты_____________ */

app.post('/createPost', upload.any('file'), async (req, res) => {
    try {
        const { creator, text, type } = JSON.parse(req.body.json);
        const files = req.files;

        const post = new Post({ creator, type, text, created: new Date });

        fs.mkdirSync(`./public/posts/${post._id}`);
        fs.mkdirSync(`./public/posts/${post._id}/comments`);

        await post.save();

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];

            let filename = '';
            if(mimetype == 'application') filename = files[i].originalname;
            else filename = str_rand(10) + '.' + files[i].mimetype.split('/')[1];

            fs.renameSync(files[i].path, `./public/posts/${post._id}/${filename}`);
            await Post.updateOne({ _id: post._id }, { $push: { files: { src: filename, mimetype } } });
        }

        const updPost = await Post.findOne({ _id: post._id });
        const formedPost = await formPost(updPost, creator);

        res.json({ error: false, post: formedPost });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changePost', upload.any('file'), async (req, res) => {
    try {
        const { postId, text, deletedFiles } = JSON.parse(req.body.json);
        const files = req.files;

        await Post.updateOne({ _id: postId }, { $set: { text, edit: true } });

        if(deletedFiles.length != 0) for(let i = 0; i < deletedFiles.length; i++) {
            const src = deletedFiles[i].src.split('/')[deletedFiles[i].src.split('/').length - 1];
            fs.unlinkSync(`./public/posts/${postId}/${src}`);
            await Post.updateOne({ _id: postId }, { $pull: { files: { src } } });
        }

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];

            let filename = '';
            if(mimetype == 'application') filename = files[i].originalname;
            else filename = str_rand(10) + '.' + files[i].mimetype.split('/')[1];

            fs.renameSync(files[i].path, `./public/posts/${postId}/${filename}`);
            await Post.updateOne({ _id: postId }, { $push: { files: { src: filename, mimetype } } });
        }

        const post = await Post.findOne({ _id: postId });
        const formedPost = await formPost(post, post.creator);

        res.json({ error: false, post: formedPost });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deletePost', async (req, res) => {
    try {
        const { postId } = req.body;

        fs.rmSync(`./public/posts/${postId}`, { recursive: true });
        await Post.deleteOne({ _id: postId });
        await Comment.deleteMany({ post: postId });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getPosts', async (req, res) => {
    try {
        const { userId, groupId, senderId, type, search, count } = req.body;

        let posts = [];
        let maxCount = 0;

        if(type == 'user') {
            posts = await Post.find({ creator: userId, text: { $regex: search } }).sort({ $natural: -1 }).skip(count * loadSize).limit(loadSize);
            maxCount = await Post.find({ creator: userId, text: { $regex: search } }).countDocuments();

            for(let i = 0; i < posts.length; i++) posts[i] = await formPost(posts[i], senderId);
        }
        else if(type == 'group') {
            posts = await Post.find({ creator: groupId, text: { $regex: search } }).sort({ $natural: -1 }).skip(count * loadSize).limit(loadSize);
            maxCount = await Post.find({ creator: groupId, text: { $regex: search } }).countDocuments();

            for(let i = 0; i < posts.length; i++) posts[i] = await formPost(posts[i], senderId);
        }
        else {
            const userData = await User.findOne({ _id: senderId }, { friends: 1, groups: 1 });

            posts = await Post.find({ $or: [{ creator: senderId }, { creator: { $in: userData.friends } }, { creator: { $in: userData.groups } }], text: { $regex: search } }).sort({ $natural: -1 }).skip(count * loadSize).limit(loadSize);
            maxCount = await Post.find({ $or: [{ creator: senderId }, { creator: { $in: userData.friends } }, { creator: { $in: userData.groups } }], text: { $regex: search } }).countDocuments();

            for(let i = 0; i < posts.length; i++) posts[i] = await formPost(posts[i], senderId);

            if(posts.length < 10) {
                const c = count == 0 ? 0 : Math.ceil(Math.abs(maxCount - (count * loadSize)) / 10);
                const allPosts = await Post.find().sort({ likeCount: -1 }).skip(c * loadSize).limit(loadSize);
                maxCount += await Post.find().countDocuments();

                for(let i = 0; i < allPosts.length; i++) posts.push(await formPost(allPosts[i], senderId));
            }
        }

        res.json({ error: false, posts, maxCount });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/likePost', async (req, res) => {
    try {
        const { postId, senderId } = req.body;

        const like = new Like({ user: senderId, post: postId });
        await like.save();
        await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/unlikePost', async (req, res) => {
    try {
        const { postId, senderId } = req.body;

        await Like.deleteOne({ user: senderId, post: postId });
        await Post.updateOne({ _id: postId }, { $inc: { likeCount: -1 } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

async function formPost(post, senderId) {
    switch(post.type) {
        case 'user': {
            const user = await User.findOne({ _id: post.creator }, { avatar: 1, username: 1 });
            const like = await Like.findOne({ post: post._id, user: senderId });
            return { ...post._doc, creator: { _id: user._id, avatar: user.avatar, name: user.username, creator: senderId == post.creator }, like: like == null ? false : true };
        }

        case 'group': {
            const group = await Group.findOne({ _id: post.creator }, { avatar: 1, name: 1, creator: 1, admins: 1 });
            const creator = group.creator == senderId || group.admins.includes(senderId);
            const like = await Like.findOne({ post: post._id, user: senderId });
            return { ...post._doc, creator: { _id: group._id, avatar: group.avatar, name: group.name, creator }, like: like == null ? false : true };
        }
    }
}

/* _____________Комментарии_____________ */

app.post('/createComment', upload.any('file'), async (req, res) => {
    try {
        const { senderId, postId, text } = JSON.parse(req.body.json);
        const files = req.files;

        const comment = new Comment({ user: senderId, post: postId, text, created: new Date() });

        fs.mkdirSync(`./public/posts/${postId}/comments/${comment._id}`);
        await comment.save();
        await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];
            const filename = str_rand(10) + '.' + files[i].originalname.split('.')[files[i].originalname.split('.').length - 1];

            fs.renameSync(files[i].path, `./public/posts/${postId}/comments/${comment._id}/${filename}`);
            await Comment.updateOne({ _id: comment._id }, { $push: { files: { originalname: files[i].originalname, src: filename, mimetype } } });
        }

        const updComment = await Comment.findOne({ _id: comment._id });
        const formedComment = await formComment(updComment);

        res.json({ error: false, comment: formedComment });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeComment', upload.any('file'), async (req, res) => {
    try {
        const { postId, commentId, text, deletedFiles } = JSON.parse(req.body.json);
        const files = req.files;

        await Comment.updateOne({ _id: commentId }, { $set: { text, edit: true } });

        if(deletedFiles.length != 0) for(let i = 0; i < deletedFiles.length; i++) {
            const src = deletedFiles[i].src.split('/')[deletedFiles[i].src.split('/').length - 1];
            fs.unlinkSync(`./public/posts/${postId}/comments/${commentId}/${src}`);
            await Comment.updateOne({ _id: commentId }, { $pull: { files: { src } } });
        }

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];
            const filename = str_rand(10) + '.' + files[i].originalname.split('.')[files[i].originalname.split('.').length - 1];

            fs.renameSync(files[i].path, `./public/posts/${postId}/comments/${commentId}/${filename}`);
            await Comment.updateOne({ _id: commentId }, { $push: { files: { originalname: files[i].originalname, src: filename, mimetype } } });
        }

        const updComment = await Comment.findOne({ _id: commentId });
        const formedComment = await formComment(updComment);

        res.json({ error: false, comment: formedComment });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/deleteComment', async (req, res) => {
    try {
        const { postId, commentId } = req.body;

        fs.rmSync(`./public/posts/${postId}/comments/${commentId}`, { recursive: true });
        await Comment.deleteOne({ _id: commentId });
        await Post.updateOne({ _id: postId }, { $inc: { commentCount: -1 } });

        res.json({ error: false });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getComments', async (req, res) => {
    try {
        const { postId } = req.body;

        let comments = await Comment.find({ post: postId });

        for(let i = 0; i < comments.length; i++) {
            comments[i] = await formComment(comments[i]);
        }

        res.json({ error: false, comments });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

async function formComment(comment) {
    const user = await User.findOne({ _id: comment.user }, { avatar: 1, username: 1 });
    return { ...comment._doc, creator: { avatar: user.avatar, username: user.username } };
}

/* _____________Чаты и сообщения_____________ */

app.post('/createMessage', upload.any('file'), async (req, res) => {
    try {
        const { senderId, chatId, text } = JSON.parse(req.body.json);
        const files = req.files;

        const message = new Message({ user: senderId, chat: chatId, text, created: new Date() });
        await message.save();

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];
            const filename = str_rand(10) + '.' + files[i].originalname.split('.')[files[i].originalname.split('.').length - 1];

            fs.renameSync(files[i].path, `./public/chats/${chatId}/${filename}`);
            await Message.updateOne({ _id: message._id }, { $push: { files: { originalname: files[i].originalname, src: filename, mimetype } } });
        }

        res.json({ error: false, id: message._id });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getMessages', async (req, res) => {
    try {
        const { chatId, count } = req.body;

        let messages = await Message.find({ chat: chatId }).skip(count * 20).limit(20).sort({ $natural: -1 });
        const maxCount = await Message.find({ chat: chatId }).countDocuments();

        for(let i = 0; i < messages.length; i++) {
            messages[i] = await formMessage(messages[i]);
        }

        res.json({ error: false, messages, maxCount });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeMessage', upload.any('file'), async (req, res) => {
    try {
        const { messageId, chatId, text, deletedFiles } = JSON.parse(req.body.json);
        const files = req.files;

        await Message.updateOne({ _id: messageId }, { $set: { text, edit: true } });

        if(deletedFiles.length != 0) for(let i = 0; i < deletedFiles.length; i++) {
            const src = deletedFiles[i].src.split('/')[deletedFiles[i].src.split('/').length - 1];
            fs.unlinkSync(`./public/chats/${chatId}/${src}`);
            await Message.updateOne({ _id: messageId }, { $pull: { files: { src } } });
        }

        if(files.length != 0) for(let i = 0; i < files.length; i++) {
            const mimetype = files[i].mimetype.split('/')[0];
            const filename = str_rand(10) + '.' + files[i].originalname.split('.')[files[i].originalname.split('.').length - 1];

            fs.renameSync(files[i].path, `./public/chats/${chatId}/${filename}`);
            await Message.updateOne({ _id: messageId }, { $push: { files: { originalname: files[i].originalname, src: filename, mimetype } } });
        }

        res.json({ error: false, id: messageId });
    }
    catch(e) {
        console.log(e);
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/getChatFiles', async (req, res) => {
    try {
        const { chatId } = req.body;

        const messages = await Message.find({ chat: chatId }, { files: 1 });

        let files = [];
        let apps = [];
        for(let i = 0; i < messages.length; i++) {
            for(let k = 0; k < messages[i].files.length; k++) {
                if(messages[i].files[k].mimetype == 'application') apps.push(messages[i].files[k]);
                else files.push(messages[i].files[k]);
            }
        }

        res.json({ error: false, files, apps });
    }
    catch(e) {
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

app.post('/changeChat', avatarUpload.single('file'), async (req, res) => {
    try {
        const { chatId, name, oldAvatar } = JSON.parse(req.body.json);
        const file = req.file;

        await Chat.updateOne({ _id: chatId }, { $set: { name } });

        if(file != undefined) {
            const avatar = str_rand(10) + '.png';
            fs.unlinkSync(`./public/chats/${chatId}/avatar/${oldAvatar}`);
            fs.renameSync(file.path, `./public/chats/${chatId}/avatar/${avatar}`);
            await Chat.updateOne({ _id: chatId }, { $set: { avatar } });

            return res.json({ error: false, avatar });
        }

        res.json({ error: false });
    }
    catch(e) {
        console.log(e)
        res.json({ error: true, message: 'Произошла ошибка' });
    }
})

async function formMessage(message) {
    const user = await User.findOne({ _id: message.user }, { username: 1 });
    return { ...message._doc, username: user.username }
}

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', socket => {
    socket.on('online', async ({ id }) => {
        await User.updateOne({ _id: id }, { online: true });
        socket.join(id);
        console.log(socket.id, 'connect');

        const chats = await Chat.find({ users: id }, { _id: 1 });

        for(let i = 0; i < chats.length; i++) {
            socket.join(chats[i]._id.toString());
            io.to(chats[i]._id.toString()).emit('userOnline', id);
        }

        socket.on('disconnect', async () => {
            await User.updateOne({ _id: id }, { online: false, last_online: new Date() });
            console.log(socket.id, 'disconnect');

            const chats = await Chat.find({ users: id }, { _id: 1 });

            for(let i = 0; i < chats.length; i++) io.to(chats[i]._id.toString()).emit('userOffline', id);
        })
    })

    socket.on('getChats', async ({ senderId }) => {
        socket.emit('getChats', await getChats(senderId));
    })

    socket.on('getChat', async ({ senderId, chatId }) => {
        try {
            const chat = await formChat(await Chat.findOne({ _id: chatId }), senderId);
            socket.emit('getChat', chat);
        }
        catch(e) {
            socket.emit('getChat', null);
        }
    })

    socket.on('createChat', async ({ type, senderId, userId, name }) => {
        switch(type) {
            case 'personal': {
                const already = await Chat.findOne({ type, users: { $all: [senderId, userId] } });
                if(already != null) return socket.emit('createChat', { error: false, id: already._id });

                const chat = new Chat({ creator: senderId, users: [senderId, userId], type });

                fs.mkdirSync(`./public/chats/${chat._id}`);

                await chat.save();

                socket.join(chat._id.toString());
                io.to(senderId).emit('getChats', await getChats(senderId));
                io.to(userId).emit('getChats', await getChats(userId));
                socket.emit('createChat', { error: false, id: chat._id });

                break;
            }

            case 'public': {
                if(name.trim() == '') return socket.emit('createChat', { error: true, message: 'Название чата не может быть пустым' });
                if(name.length > 30) return socket.emit('createChat', { error: true, message: 'Название чата не может быть длиннее 30 символов' });

                const avatar = str_rand(10) + '.png';
                const chat = new Chat({ creator: senderId, users: [senderId], type, name, avatar });

                fs.mkdirSync(`./public/chats/${chat._id}`);
                fs.mkdirSync(`./public/chats/${chat._id}/avatar`);
                fs.copyFileSync('./src/defaultChat.png', `./public/chats/${chat._id}/avatar/${avatar}`);

                await chat.save();

                socket.join(chat._id.toString());
                io.to(senderId).emit('getChats', await getChats(senderId));
                socket.emit('createChat', { error: false, id: chat._id });

                break;
            }
        }
    })

    socket.on('sendMessage', async ({ messageId, chatId }) => {
        const message = await formMessage(await Message.findOne({ _id: messageId }));
        io.to(chatId).emit('getMessage', message);
    })

    socket.on('changeMessage', async ({ messageId, chatId }) => {
        const message = await formMessage(await Message.findOne({ _id: messageId }));
        io.to(chatId).emit('changeMessage', message);
    })

    socket.on('deleteMessage', async ({ message }) => {
        for(let i = 0; i < message.files.length; i++) {
            fs.rmSync(`./public/chats/${message.chat}/${message.files[i].src}`, { recursive: true });
        }

        await Message.deleteOne({ _id: message._id });

        io.to(message.chat).emit('deleteMessage', message._id);
    })

    socket.on('joinChat', async ({ chatId }) => socket.join(chatId))

    socket.on('signOutChat', async ({ senderId, chatId }) => {
        await Chat.updateOne({ _id: chatId }, { $pull: { users: senderId } });

        const chat = await Chat.findOne({ _id: chatId }, { users: 1 });

        if(chat.users.length == 0) {
            fs.rmSync(`./public/chats/${chatId}`, { recursive: true });
            await Chat.deleteOne({ _id: chatId });
        }
        else {
            await Chat.updateOne({ _id: chatId }, { $push: { leaveUsers: senderId } });
        }

        socket.emit('getChats', await getChats(senderId));
    })

    socket.on('inviteUser', async ({ chatId, userId }) => {
        await Chat.updateOne({ _id: chatId }, { $push: { users: userId } });

        const chat = await Chat.findOne({ _id: chatId }, { leaveUsers: 1 });
        if(chat.leaveUsers.includes(userId)) await Chat.updateOne({ _id: chatId }, { $pull: { leaveUsers: userId } });

        io.to(userId).emit('getChats', await getChats(userId));
    })
})

async function getChats(senderId) {
    let chats = await Chat.find({ users: senderId });

    for(let i = 0; i < chats.length; i++) {
        chats[i] = await formChat(chats[i], senderId);
    }

    return chats;
}

async function formChat(chat, senderId) {
    switch(chat.type) {
        case 'personal': {
            let user = {};
            if(chat.users.length == 1) user = chat.leaveUsers[0];
            else user = chat.users.filter(user => user != senderId)[0];
            const userData = await User.findOne({ _id: user }, { username: 1, avatar: 1, online: 1, last_online: 1, notify: 1 });

            return { ...chat._doc, user: { ...userData._doc } };
        }

        case 'public': {
            return chat;
        }
    }
}
