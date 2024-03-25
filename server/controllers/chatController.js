const Chat = require('../models/Chat');
const User = require('../models/User');
const fs = require('fs');

class chatController {
    async createChat(req, res) {
        try {
            const { userID1, userID2 } = req.body;

            const chat = new Chat({name: '', users: [userID1, userID2]});
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
                if(chats[i].name == '') {
                    for(let j = 0; j < chats[i].users.length; j++) {
                        if(chats[i].users[j].toString() != id) {
                            const chat = await User.findOne({_id: chats[i].users[j]}, {username: 1, online: 1});
                            chats[i] = { _id: chats[i]._id, name: chat.username, avatar: chats[i].users[j], online: chat.online };
                            break;
                        }
                    }
                }
            }

            res.json(chats);
        }
        catch(e) {
            console.log(e);
            res.json(false);
        }
    }
}

module.exports = new chatController();