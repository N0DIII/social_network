const { Server } = require('socket.io');

const io = new Server({
    cors: {
        origin: '*'
    }
})

io.listen(4000);

io.on('connection', socket => {
    console.log(socket.id)

    socket.on('disconnect', async () => {
        console.log('disconnect');
    })
})