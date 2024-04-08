const { Schema, model, ObjectId } = require('mongoose');

const Chat = new Schema({
    name: {type: String},
    users: [{type: ObjectId, ref: 'User'}],
    leave: [{type: ObjectId, ref: 'User'}],
    type: {type: String},
    notify: [{type: ObjectId, ref: 'User'}]
})

module.exports = model('Chat', Chat);