const User = require('../models/User');
const Group = require('../models/Group');
const Post = require('../models/Post');
const File = require('../models/File');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const fs = require('fs');
const multer  = require('multer');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    }
})

const filter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'image' || file.mimetype.split('/')[0] == 'video') cb(null, true)
    else cb(null, false)
}

const imageFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'image') cb(null, true)
    else cb(null, false)
}

const videoFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'video') cb(null, true)
    else cb(null, false)
}

const fileFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] == 'application') cb(null, true)
    else cb(null, false)
}

class postController {
    upload = multer({storage: storageConfig, fileFilter: filter})
    uploadImage = multer({storage: storageConfig, fileFilter: imageFilter})
    uploadVideo = multer({storage: storageConfig, fileFilter: videoFilter})
    uploadFile = multer({storage: storageConfig, fileFilter: fileFilter})

    async addPost(req, res) {
        try {
            const { creator, text, type } = JSON.parse(req.body.json);
            const files = req.files;

            if(text.trim() == '') {
                files.forEach(file => fs.unlinkSync(file.path));
                return res.json({ error: true, message: 'Текст не может быть пустым'});
            }

            let post;
            if(type == 'user') post = new Post({ user: creator, text, type: files.length == 0 ? 'text' : 'file', created: new Date() });
            if(type == 'group') post = new Post({ group: creator, text, type: files.length == 0 ? 'text' : 'file', created: new Date() });

            fs.mkdirSync(`./public/posts/${post._id}`);
            fs.mkdirSync(`./public/posts/${post._id}/comments`);
            files.forEach(item => {
                const file = new File({ post: post._id, type: item.mimetype, name: item.originalname });
                fs.renameSync(item.path, `./public/posts/${post._id}/${file._id}.${item.mimetype.split('/')[1]}`);
                file.save();
            })

            post.save();
            res.json({ error: false });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при сохранении поста' });
        }
    }

    async editPost(req, res) {
        try {
            const { post, creator, text, type, deleted } = JSON.parse(req.body.json);
            const files = req.files;

            if(text.trim() == '') {
                files.forEach(file => fs.unlinkSync(file.path));
                return res.json({ error: true, message: 'Текст не может быть пустым'});
            }

            let postFiles = await File.find({ post });
            for(let i = 0; i < postFiles.length; i++) {
                for(let j = 0; j < deleted.length; j++) {
                    if(`${postFiles[i]._id}.${postFiles[i].type.split('/')[1]}` == deleted[j].src.split('/')[deleted[j].src.split('/').length - 1]) {
                        await File.deleteOne({ _id: postFiles[i]._id });
                        fs.unlinkSync(`./public/posts/${post}/${postFiles[i]._id}.${postFiles[i].type.split('/')[1]}`);
                        postFiles.splice(i, 1);
                    }
                }
            }

            if(type == 'user') await Post.updateOne({ user: creator }, { $set: { text, type: files.length != 0 || postFiles.length != 0 ? 'file' : 'text', edit: true } });

            files.forEach(item => {
                const file = new File({ post: post, type: item.mimetype, name: item.originalname });
                fs.renameSync(item.path, `./public/posts/${post}/${file._id}.${item.mimetype.split('/')[1]}`);
                file.save();
            })

            res.json({ error: false });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при изменении поста' });
        }
    }

    async getPosts(req, res) {
        try {
            const { user, count, search, filter } = req.body;

            let findPosts = [], maxCount = 0;
            if(filter[0] == 'user') {
                findPosts = await Post.find({ user: filter[1], text: { $regex: search }}).skip(count * 10).limit(10);
                maxCount = await Post.find({ user: filter[1], text: { $regex: search }}).countDocuments();
            }
            else if(filter[0] == 'group') {
                findPosts = await Post.find({ group: filter[1], text: { $regex: search }}).skip(count * 10).limit(10);
                maxCount = await Post.find({ group: filter[1], text: { $regex: search }}).countDocuments();
            }
            else {
                const userdata = await User.findOne({ _id: user }, { friends: 1, groups: 1 });
                findPosts = await Post.find({ $or: [{ user }, { user: { $in: userdata.friends } }, { group: { $in: userdata.groups } }], text: { $regex: search }}).sort({ $natural: -1 }).skip(count * 10).limit(10);
                maxCount = await Post.find({ $or: [{ user }, { user: { $in: userdata.friends } }, { group: { $in: userdata.groups } }], text: { $regex: search }}).countDocuments();
            }

            let posts = [];
            for(let i = 0; i < findPosts.length; i++) {
                let creator, like = false;

                const likePost = await Like.findOne({ user, post: findPosts[i]._id });
                if(likePost != null) like = true;

                if(findPosts[i]?.user != undefined) {
                    const user = await User.findOne({ _id: findPosts[i].user }, { username: 1, avatar: 1 });
                    creator = { _id: user._id, name: user.username, avatar: user.avatar };
                }
                else if(findPosts[i]?.group != undefined) {
                    const group = await Group.findOne({ _id: findPosts[i].group }, { name: 1, admins: 1, avatar: 1 });
                    creator = { _id: group._id, name: group.name, admins: group.admins, avatar: group.avatar };
                }

                if(findPosts[i].type == 'text') posts.push({ ...findPosts[i]._doc, creator, like });
                else if(findPosts[i].type == 'file') {
                    const files = await File.find({ post: findPosts[i]._id });
                    posts.push({ ...findPosts[i]._doc, files, creator, like });
                }
            }

            res.json({ posts, maxCount });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении постов' });
        }
    }

    async deletePost(req, res) {
        try {
            const { id } = req.body;

            fs.rmSync(`./public/posts/${id}`, { recursive: true });
            await Post.deleteOne({ _id: id });
            await File.deleteMany({ post: id });
            await Like.deleteMany({ post: id });
            await Comment.deleteMany({ post: id });

            res.json({ error: false, id });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при удалении поста' });
        }
    }

    async addLike(req, res) {
        const { user, post } = req.body;

        const like = new Like({ post, user });
        await like.save();
        await Post.updateOne({ _id: post }, { $inc: { likeCount: 1 } });

        res.json(true);
    }

    async deleteLike(req, res) {
        const { user, post } = req.body;

        await Like.deleteOne({ user, post });
        await Post.updateOne({ _id: post }, { $inc: { likeCount: -1 } });

        res.json(true);
    }

    async sendComment(req, res) {
        const { user, post, text } = req.body;

        let comment = new Comment({ user, post, text, type: 'text', created: new Date() });
        await comment.save();
        await Post.updateOne({ _id: post }, { $inc: { commentCount: 1 } });

        const count = await Comment.find({ post }).countDocuments();

        res.json(count);
    }

    async sendImage(req, res) {
        saveFile(req, res, 'image');
    }

    async sendVideo(req, res) {
        saveFile(req, res, 'video');
    }

    async sendFile(req, res) {
        saveFile(req, res, 'file');
    }

    async getComments(req, res) {
        const { post } = req.body;

        let comments = await Comment.find({ post });
        for(let i = 0; i < comments.length; i++) {
            const user = await User.findOne({ _id: comments[i].user }, { username: 1, avatar: 1 });
            comments[i] = { ...comments[i]._doc, user };
        }

        res.json(comments);
    }

    async deleteComment(req, res) {
        try {
            const { id, post, type, filename } = req.body;

            if(type != 'text') fs.unlinkSync(`./public/posts/${post}/comments/${filename}`);

            await Comment.deleteOne({ _id: id });
            await Post.updateOne({ _id: post }, { $inc: { commentCount: -1 } });
            const count = await Comment.find({ post }).countDocuments();

            res.json(count);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при удалении комментария' });
        }
    }

    async editComment(req, res) {
        const { id, text } = req.body;

        await Comment.updateOne({ _id: id }, { $set: { text, edit: true } });

        res.json({ error: false });
    }
}

async function saveFile(req, res, type) {
    try {
        const { user, post } = JSON.parse(req.body.json);
        const file = req.file;

        if(!file) return res.json({ error: true, message: 'Неверный тип файла' });

        const comment = await new Comment({ user, post, created: new Date(), type: type, filename: file.originalname, mimetype: file.mimetype });
        await comment.save();
        await Post.updateOne({ _id: post }, { $inc: { commentCount: 1 } });

        fs.renameSync(file.path, `./public/posts/${post}/comments/${comment._id}.${file.mimetype.split('/')[1]}`);

        const count = await Comment.find({ post }).countDocuments();

        res.json(count);
    }
    catch(e) {
        console.log(e);
        res.json({ error: true });
    }
}

module.exports = new postController();
