const { Server } = require('socket.io');
const User = require('./models/User');

const io = new Server({
    cors: {
        origin: '*'
    }
})

io.listen(4000);

io.on('connection', socket => {
    socket.on('online', async ({ id }) => {
        await User.updateOne({_id: id}, {online: true});

        socket.on('disconnect', async () => {
            await User.updateOne({_id: id}, {online: false});
        })
    })
})