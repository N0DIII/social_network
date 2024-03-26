const { Schema, model, ObjectId } = require('mongoose');

const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    sex: {type: String, ref: 'Sex'},
    birthday: {type: Date},
    friends: [{type: ObjectId, ref: 'User'}],
    friend_requests: [{type: ObjectId, ref: 'User'}],
    online: {type: Boolean},
    last_online: {type: Date}
})

module.exports = model('User', User);