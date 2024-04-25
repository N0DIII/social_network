const { Schema, model } = require('mongoose');

const User = new Schema({
    username: String,
    password: String,
    sex: String,
    birthday: Date,
    friends: [Schema.Types.ObjectId],
    friend_requests: [Schema.Types.ObjectId],
    online: Boolean,
    last_online: Date,
    delete: Boolean,
    notify: [{ chat: Schema.Types.ObjectId, count: Number }],
    groups: [Schema.Types.ObjectId]
}, { versionKey: false })

module.exports = model('User', User);