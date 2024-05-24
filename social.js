const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const str_rand = require('./str_rand');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const albumRouter = require('./routers/albumRouter');
const chatRouter = require('./routers/chatRouter');
const groupRouter = require('./routers/groupRouter');
const postRouter = require('./routers/postRouter');
const PORT = process.env.PORT;

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

app.use(cors({origin: '*'}));
app.use(bodyParser.json({limit: '500mb'}));
app.use(express.static('public'));
app.use(express.static('./client/build'));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/album', albumRouter);
app.use('/chat', chatRouter);
app.use('/group', groupRouter);
app.use('/post', postRouter);

app.post('*', (req, res) => res.json({ error: true, message: 'Произошла ошибка'}));
app.get('*', (req, res) => res.sendFile(__dirname + '/client/build/index.html'));

const start = async () => {
    try {
        const dir = ['./public', './public/chats', './public/groups', './public/posts', './public/users'];
        for(let i = 0; i < dir.length; i++) {
            if(!fs.existsSync(dir[i])) fs.mkdirSync(dir[i]);
        }

        await mongoose.connect(process.env.MONGODB_URL);
        server.listen(PORT, () => console.log(`server started on port ${PORT}`));
    }
    catch(e) {
        console.log(e);
    }
}

start();

io.on('connection', socket => {
    socket.on('online', async ({ id }) => {
        await User.updateOne({_id: id}, {online: true});
        socket.join(id);

        const chats = await Chat.find({users: {$in: id}}, {_id: 1});
        chats.forEach(chat => {
            socket.join(chat._id.toString());
            socket.to(chat._id.toString()).emit('userOnline', chat._id);
        })

        socket.on('disconnect', async () => {
            await User.updateOne({_id: id}, {online: false, last_online: new Date(Date.now())});

            const chats = await Chat.find({users: {$in: id}}, {_id: 1});
            chats.forEach(chat => io.to(chat._id.toString()).emit('userOffline', chat._id));
        })
    })

    socket.on('joinChat', id => {
        socket.join(id);
    })

    socket.on('createPersonalChat', async ({ user1, user2 }) => {
        const isChat = await Chat.findOne({ users: { $all: [user1, user2] }, type: 'personal' }, { _id: 1 });
        if(isChat != null) return socket.emit('createPersonalChat', isChat._id);

        const chat = new Chat({users: [user1, user2], type: 'personal'});

        fs.mkdir(`./public/chats/${chat._id}`, async e => {
            if(e) console.log(e)
            else {
                await chat.save();
                await User.updateOne({ _id: user1 }, { $push: { notify: { chat: chat._id, count: 0 } } });
                await User.updateOne({ _id: user2 }, { $push: { notify: { chat: chat._id, count: 0 } } });

                socket.join(chat._id.toString());
                socket.to(user2).emit('createdChat', chat._id);
                socket.emit('createdChat', chat._id);
                socket.emit('createPersonalChat', chat._id);
            }
        })
    })

    socket.on('createPublicChat', async ({ user, name }) => {
        if(name.trim() == '') return socket.emit('createPublicChat', { error: true, message: 'Название чата не может быть пустым' });
        if(name.length >= 15) return socket.emit('createPublicChat', { error: true, message: 'Название чата не может быть длиннее 15 символов' });

        const isChat = await Chat.findOne({ name }, { _id: 1 });
        if(isChat != null) return socket.emit('createPublicChat', { error: true, message: 'Чат с таким именем уже существует' });

        const chat = new Chat({ users: [user], type: 'public', name, creator: user });

        fs.mkdir(`./public/chats/${chat._id}`, async e => {
            if(e) {
                console.log(e);
                return socket.emit('createPublicChat', { error: true, message: 'Произошла ошибка при создании чата' });
            }
            else {
                const avatar = str_rand(10);
                await fs.copyFile('./src/defaultChat.png', `./public/chats/${chat._id}/avatar_${avatar}.png`, async e => {
                    if(e) {
                        console.log(e);
                        return socket.emit('createPublicChat', { error: true, message: 'Произошла ошибка при создании чата' });
                    }
                    else {
                        await chat.save();
                        await User.updateOne({ _id: user }, { $push: { notify: { chat: chat._id, notify: 0 } } });
                        await Chat.updateOne({ _id: chat._id }, { $set: { avatar }});

                        socket.join(chat._id.toString());
                        socket.emit('createdChat', chat._id);
                        socket.emit('createPublicChat', { error: false, id: chat._id });
                    }
                })
            }
        })
    })

    socket.on('sendMessage', async ({ user, chat, text }) => {
        let message = new Message({text: text, user: user, chat: chat, created: new Date(), type: 'text'});
        await message.save();

        const username = await User.findOne({ _id: user }, { username: 1 });
        message = { ...message._doc, username: username.username };

        io.to(chat).emit('getMessage', message);

        const _chat = await Chat.findOne({_id: chat}, {users: 1});
        _chat.users.forEach(async notifyUser => {
            if(notifyUser != user) {
                let notify = await User.findOne({ _id: notifyUser }, { notify: 1 });
                notify = notify.notify.map(item => {
                    if(item.chat == chat) return { chat, count: item.count + 1 };
                    else return item;
                })
                await User.updateOne({ _id: notifyUser }, { $set: { notify }});
                socket.to(notifyUser.toString()).emit('newMessage', notify.find(item => item.chat == chat));
            }
        })
    })

    socket.on('readChat', async ({ chatID, userID }) => {
        const user = await User.findOne({ _id: userID }, { notify: 1 });
        const notify = user.notify.map(item => {
            if(item.chat.toString() == chatID) return { _id: item._id, chat: item.chat, count: 0};
            else return item;
        })
        await User.updateOne({ _id: userID }, { $set: { notify } });
        socket.emit('newMessage', notify.find(item => item.chat.toString() == chatID));
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

    socket.on('addUsersInPublicChat', async ({ users, chat }) => {
        let already = await Chat.findOne({ _id: chat }, { users: 1 });
        already.users.map(item => item.toString());
        users.forEach(async user => {
            if(!already.users.includes(user._id)) {
                await Chat.updateOne({ _id: chat }, { $addToSet: { users: user._id } });
                await User.updateMany({ _id: { $in: users } }, { $addToSet: { notify: { chat, count: 0 } } });
                socket.to(user._id).emit('createdChat', chat);
            }
        })
    })
})