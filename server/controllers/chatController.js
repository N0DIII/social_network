const Chat = require('../models/Chat');
const User = require('../models/User');

class chatController {
    async createChat(req, res) {
        try {
            const { userID1, userID2 } = req.body;

            const chat = new Chat({name: '', users: [userID1, userID2]});
            chat.save();

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
                            const name = await User.findOne({_id: chats[i].users[j]}, {username: 1});
                            chats[i] = { _id: chats[i]._id, name: name.username, avatar: chats[i].users[j] };
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