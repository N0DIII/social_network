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

        const chats = await Chat.find({users: {$in: id}}, {_id: 1});
        chats.forEach(chat => {
            socket.join(chat._id.toString());
            socket.to(chat._id.toString()).emit('update');
        })

        socket.on('disconnect', async () => {
            await User.updateOne({_id: id}, {online: false});

            const chats = await Chat.find({users: {$in: id}}, {_id: 1});
            chats.forEach(chat => io.to(chat._id.toString()).emit('update'));
        })
    })

    socket.on('getMessages', async ({ id }) => {
        const chat = await Chat.findOne({_id: id}, {_id: 1});
        const messages = await Message.find({chat: id}, {chat: 0}).sort({$natural: -1});
        socket.emit('getMessages', { messages, chat });
    })

    socket.on('sendMessage', async ({ user, chat, text }) => {
        const message = new Message({text: text, user: user, chat: chat, created: new Date(), type: 'text'});
        await message.save();

        io.to(chat).emit('getMessage', message);
    })

    socket.on('deleteMessage', async ({ message, chat }) => {
        await Message.deleteOne({_id: message});
        io.to(chat).emit('deleteMessage', { id: message });
    })

    socket.on('editMessage', async ({ text, message, chat }) => {
        await Message.updateOne({_id: message}, {text: text, edit: true});
        const editedMessage = await Message.findOne({_id: message});

        io.to(chat).emit('editMessage', editedMessage);
    })

    socket.on('sendImage', async ({ user, chat, image}) => {
        const message = new Message({user, chat, created: new Date(), type: 'image'});
        await message.save();

        const buff = new Buffer.from(image.split(',')[1], 'base64').toString('binary');
        const type = (data.split('/')[1]).split(';')[0];
        fs.writeFile(`./public/chats/${chat}/${message._id}.${type}`, buff, 'binary', e => {if(e) console.log(e)});

        io.to(chat).emit('getMessage', message);
    })
})