const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

const generateAccessToken = (id) => {
    const payload = { id };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '30d' });
}

class authController {
    async registration(req, res) {
        try {
            const { username, password, repeatPassword } = req.body;

            if(username.trim() == '') return res.json({ field: 0, message: 'Имя пользователя не может быть пустым' });
            if(username.length > 20) return res.json({ field: 0, message: 'Имя пользователя не может быть длиннее 20 символов' });
            if(password.length < 5) return res.json({ field: 1, message: 'Пароль должен быть длиннее 4 символов' });
            if(password.length > 20) return res.json({ field: 1, message: 'Пароль не может быть длиннее 20 символов' });
            if(password != repeatPassword) return res.json({ field: 2, message: 'Пароли не совпадают' });

            const candidate = await User.findOne({ username });
            if(candidate) return res.json({ field: 0, message: 'Пользователь с таким именем уже существует' });

            const hashPassword = bcrypt.hashSync(password, 7);

            const user = new User({ username, password: hashPassword });
            await user.save();

            await fs.mkdir(`./public/users/${user._id}`, e => {if(e) console.log(e)});
            await fs.mkdir(`./public/users/${user._id}/albums`, e => {if(e) console.log(e)});
            await fs.copyFile('./src/defaultAvatar.png', `./public/users/${user._id}/avatar.png`, e => {if(e) console.log(e)});

            const token = generateAccessToken(user._id);
            return res.json({ token });
        }
        catch(e) {
            console.log(e);
            res.json({ message: 'Ошибка регистрации' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if(username.length > 20) return res.json({ field: 0, message: 'Имя пользователя не может быть длиннее 20 символов' });

            const user = await User.findOne({ username });
            if(!user || user.delete) return res.json({ field: 0, message: `Пользователь ${username} не найден` });

            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword) return res.json({ field: 1, message: 'Введен неверный пароль' });

            const token = generateAccessToken(user._id);
            return res.json({ token });
        }
        catch(e) {
            console.log(e);
            res.json({ message: 'Ошибка входа' });
        }
    }

    async authorization(req, res) {
        try {
            const token = req.headers.authorization;
            if(token == 'null') return res.json({ auth: false });
    
            const decodedData = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({ _id: decodedData.id }, { password: 0 });

            if(user) return res.json(user);
            else return res.json({ auth: false });
        }
        catch(e) {
            return res.json({ auth: false });
        }
    }
}

module.exports = new authController();