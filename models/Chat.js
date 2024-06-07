const { Schema, model } = require('mongoose');

const Chat = new Schema({
    name: String,
    creator: Schema.Types.ObjectId,
    users: [Schema.Types.ObjectId],
    leaveUsers: [Schema.Types.ObjectId],
    type: String,
    avatar: String
}, { versionKey: false })

module.exports = model('Chat', Chat);