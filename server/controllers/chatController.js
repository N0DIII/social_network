const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const fs = require('fs');
const multer  = require('multer');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    }
})

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

class chatController {
    uploadImage = multer({storage: storageConfig, fileFilter: imageFilter})
    uploadVideo = multer({storage: storageConfig, fileFilter: videoFilter})
    uploadFile = multer({storage: storageConfig, fileFilter: fileFilter})

    async getChats(req, res) {
        try {
            const { id } = req.body;

            let chats = await Chat.find({ users: { $in: [id] } });
            
            for(let i = 0; i < chats.length; i++) {
                chats[i] = await formChat(chats[i]._id, id);
            }

            res.json(chats);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при получении чатов' });
        }
    }

    async getChat(req, res) {
        try {
            const { chatID, userID } = req.body;

            const chat = await formChat(chatID, userID);

            res.json(chat);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка при получении чата' });
        }
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

    async getPhoto(req, res) {
        try {
            const { id } = req.body;

            const photo = await Message.find({ type: 'image', chat: id });

            res.json(photo);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении фотографий'});
        }
    }

    async getVideo(req, res) {
        try {
            const { id } = req.body;

            const video = await Message.find({ type: 'video', chat: id });

            res.json(video);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении видео'});
        }
    }

    async getFile(req, res) {
        try {
            const { id } = req.body;

            const file = await Message.find({ type: 'file', chat: id });

            res.json(file);
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при получении файлов'});
        }
    }

    async deleteChat(req, res) {
        try {
            const { chatID, userID } = req.body;

            const chat = await Chat.findOne({ _id: chatID }, { users: 1 });
            if(chat.users.length != 1) await Chat.updateOne({ _id: chatID }, { $pull: { users: userID }, $push: { leave: userID } });
            else await Chat.deleteOne({ _id: chatID });

            res.json({ error: false });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Произошла ошибка при выходе из чата' });
        }
    }
}

async function saveFile(req, res, type) {
    try {
        const { user, chat } = JSON.parse(req.body.json);
        const file = req.file;

        if(!file) return res.json({error: true, message: 'Неверный тип файла'});

        const message = await new Message({user, chat, created: new Date(), type: type, filename: file.originalname});
        await message.save();

        fs.rename(file.path, `./public/chats/${chat}/${message._id}.${getType(file.originalname)}`, e => {if(e) console.log(e)});

        res.json(message);
    }
    catch(e) {
        console.log(e);
        res.json({ error: true });
    }
}

async function formChat(chatID, userID) {
    let chat = await Chat.findOne({ _id: chatID });

    let type = chat.type, name = '', avatar = '', online = false, last_online = false;
    let notify = await Chat.findOne({ _id: chatID, notify: { $in: [userID] } }, { _id: 1 });
    if(notify != null) notify = true;
    else notify = false;

    if(type == 'personal') {
        let user;
        if(chat.users.length == 1) {
            user = await User.findOne({ _id: chat.leave[0] });
            avatar = chat.leave[0];
        }
        else {
            for(let i = 0; i < chat.users.length; i++) {
                if(chat.users[i].toString() != userID) {
                    user = await User.findOne({ _id: chat.users[i] }, { username: 1, online: 1, last_online: 1 });
                    avatar = chat.users[i];
                    break;
                }
            }
        }

        name = user.username;
        online = user.online;
        last_online = user.last_online;
    }
    else if(type == 'public') {
        avatar = `/chats/${chatID}/avatar.png`;
    }

    return { _id: chatID, name, avatar, online, last_online, type, notify };
}

const getType = (str) => str.split('.')[str.split('.').length - 1];

module.exports = new chatController();