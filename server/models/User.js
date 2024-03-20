const { Schema, model, ObjectId } = require('mongoose');

const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    sex: {type: String, ref: 'Sex'},
    birthday: {type: Date},
    rooms: [{type: ObjectId, ref: 'Room'}],
    friends: [{type: ObjectId, ref: 'User'}],
    friend_requests: [{type: ObjectId, ref: 'User'}]
})

module.exports = model('User', User);