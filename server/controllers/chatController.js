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

    async createPersonalChat(req, res) {
        try {
            const { userID1, userID2 } = req.body;

            const chat = new Chat({users: [userID1, userID2], type: 'personal'});
            chat.save();

            const src = `./public/chats/${chat._id}`;
            fs.mkdir(src, e => {if(e) console.log(e)});

            res.json(chat);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getChats(req, res) {
        try {
            const { id } = req.body;

            let chats = await Chat.find({users: {$in: [id]}});
            
            for(let i = 0; i < chats.length; i++) {
                if(chats[i].type == 'personal') {
                    for(let j = 0; j < chats[i].users.length; j++) {
                        if(chats[i].users[j].toString() != id) {
                            const chat = await User.findOne({_id: chats[i].users[j]}, {username: 1, online: 1});
                            chats[i] = { _id: chats[i]._id, name: chat.username, avatar: chats[i].users[j], online: chat.online };
                            break;
                        }
                    }
                }
                else if(chats[i].type == 'public') {
                    chats[i] = { _id: chats[i]._id, name: chats[i].name, avatar: `/chats/${chats[i]._id}/avatar.png`, online: false };
                }
            }

            res.json(chats);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }

    async getChat(req, res) {
        try {
            const { chatID, userID } = req.body;

            let chat = await Chat.findOne({_id: chatID}, {_id: 0});

            if(chat.type == 'personal') {
                for(let i = 0; i < chat.users.length; i++) {
                    if(chat.users[i].toString() != userID) {
                        const user = await User.findOne({_id: chat.users[i]}, {username: 1, online: 1});
                        chat = { _id: chat._id, name: user.username, avatar: chat.users[i], online: user.online };
                        break;
                    }
                }
            }
            else if(chat.type == 'public') {
                chat = { _id: chat._id, name: chat.name, avatar: `/chats/${chat._id}/avatar.png`, online: false };
            }

            res.json(chat);
        }
        catch(e) {
            console.log(e);
            res.json(false);
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
        res.json({error: true});
    }
}

const getType = (str) => str.split('.')[str.split('.').length - 1];

module.exports = new chatController();