const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const str_rand = require('../str_rand');
require('dotenv').config();

const generateAccessToken = (id) => {
    const payload = { id };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '30d' });
}

class authController {
    async registration(req, res) {
        try {
            const { username, password, repeatPassword } = req.body;

            if(username.trim() == '') return res.json({ error: true, message: 'Имя пользователя не может быть пустым' });
            if(username.length > 20) return res.json({ error: true, message: 'Имя пользователя не может быть длиннее 20 символов' });
            if(password.length < 5) return res.json({ error: true, message: 'Пароль должен быть длиннее 4 символов' });
            if(password.length > 20) return res.json({ error: true, message: 'Пароль не может быть длиннее 20 символов' });
            if(password != repeatPassword) return res.json({ error: true, message: 'Пароли не совпадают' });

            const candidate = await User.findOne({ username });
            if(candidate) return res.json({ error: true, message: 'Пользователь с таким именем уже существует' });

            const hashPassword = bcrypt.hashSync(password, 7);
            const avatar = str_rand(10);

            const user = new User({ username, password: hashPassword, avatar });
            await user.save();

            fs.mkdirSync(`./public/users/${user._id}`);
            fs.mkdirSync(`./public/users/${user._id}/albums`);
            fs.copyFileSync('./src/defaultAvatar.png', `./public/users/${user._id}/avatar_${avatar}.png`);

            const token = generateAccessToken(user._id);
            return res.json({ error: false, token });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка регистрации' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if(username.length > 20) return res.json({ error: true, message: 'Имя пользователя не может быть длиннее 20 символов' });

            const user = await User.findOne({ username });
            if(!user || user.delete) return res.json({ error: true, message: `Пользователь ${username} не найден` });

            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword) return res.json({ error: true, message: 'Введен неверный пароль' });

            const token = generateAccessToken(user._id);
            return res.json({ error: false, token });
        }
        catch(e) {
            console.log(e);
            res.json({ error: true, message: 'Ошибка входа' });
        }
    }

    async authorization(req, res) {
        try {
            const token = req.headers.authorization;
            if(token == 'null') return res.json({ auth: false });
    
            const decodedData = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({ _id: decodedData.id }, { password: 0 });
            if(!user || user.delete) return res.json({ auth: false });

            res.json(user);
        }
        catch(e) {
            return res.json({ auth: false });
        }
    }
}

module.exports = new authController();