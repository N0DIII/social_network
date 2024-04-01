const { Schema, model, ObjectId } = require('mongoose');

const Chat = new Schema({
    name: {type: String},
    users: [{type: ObjectId, ref: 'User'}],
    type: {type: String}
})

module.exports = model('Chat', Chat);