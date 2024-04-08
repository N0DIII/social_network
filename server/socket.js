const { Server } = require('socket.io');
const fs = require('fs');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const io = new Server({
    cors: {
        origin: '*'
    }
})

io.listen(4000);

io.on('connection', socket => {
    socket.on('online', async ({ id }) => {
        await User.updateOne({_id: id}, {online: true});
        socket.join(id);

        const chats = await Chat.find({users: {$in: id}}, {_id: 1});
        chats.forEach(chat => {
            socket.join(chat._id.toString());
            socket.to(chat._id.toString()).emit('update');
        })

        socket.on('disconnect', async () => {
            await User.updateOne({_id: id}, {online: false, last_online: new Date(Date.now())});

            const chats = await Chat.find({users: {$in: id}}, {_id: 1});
            chats.forEach(chat => io.to(chat._id.toString()).emit('update'));
        })
    })

    socket.on('joinChat', id => {
        socket.join(id);
    })

    socket.on('createPersonalChat', async ({ user1, user2 }) => {
        const isChat = await Chat.findOne({ users: { $all: [user1, user2] } }, { _id: 1 });
        if(isChat != null) {
            return socket.emit('createPersonalChat', isChat._id);
        }

        const chat = new Chat({users: [user1, user2], type: 'personal'});

        fs.mkdir(`./public/chats/${chat._id}`, async e => {
            if(e) console.log(e)
            else {
                await chat.save();

                socket.to(user2).emit('createdChat', chat._id);
                socket.emit('createdChat', chat._id);
                socket.emit('createPersonalChat', chat._id);
            }
        })
    })

    socket.on('getMessages', async ({ chatId, userId, count }) => {
        try {
            const chat = await Chat.findOne({_id: chatId}, {_id: 1});
            await Chat.updateOne({_id: chatId}, {$pull: {notify: userId}});
            socket.emit('update');

            const messages = await Message.find({chat: chatId}, {chat: 0}).sort({$natural: -1}).skip(count * 20).limit(20);
            socket.emit('getMessages', messages);
        }
        catch(e) {
            socket.emit('getMessages', false);
        }
    })

    socket.on('sendMessage', async ({ user, chat, text }) => {
        const message = new Message({text: text, user: user, chat: chat, created: new Date(), type: 'text'});
        await message.save();

        io.to(chat).emit('getMessage', message);

        const chats = await Chat.findOne({_id: chat}, {users: 1});
        chats.users.forEach(async notifyUser => {
            if(notifyUser != user) await Chat.updateOne({_id: chat}, {$push: {notify: notifyUser}});
        })
        socket.to(chat).emit('update');
    })

    socket.on('deleteMessage', async ({ message, chat, filename }) => {
        await Message.deleteOne({_id: message});

        if(filename) fs.unlink(`public/chats/${chat}/${filename}`, e => {if(e) console.log(e)});

        io.to(chat).emit('deleteMessage', { id: message });
    })

    socket.on('editMessage', async ({ text, message, chat }) => {
        await Message.updateOne({_id: message}, {text: text, edit: true});
        const editedMessage = await Message.findOne({_id: message});

        io.to(chat).emit('editMessage', editedMessage);
    })

    socket.on('sendFile', async message => {
        io.to(message.chat).emit('getMessage', message);
    })
})