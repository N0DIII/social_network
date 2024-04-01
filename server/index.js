const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const albumRouter = require('./routers/albumRouter');
const chatRouter = require('./routers/chatRouter');
const PORT = process.env.PORT || 5000;
require('./socket');

const app = express();

app.use(cors({origin: '*'}));
app.use(bodyParser.json({limit: '500mb'}));
app.use(express.static('public'));
app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/album', albumRouter);
app.use('/chat', chatRouter);

app.post('*', (req, res) => res.json(false));

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/social_db');
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    }
    catch(e) {
        console.log(e);
    }
}

start();