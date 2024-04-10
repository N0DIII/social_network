const { Schema, model, ObjectId } = require('mongoose');

const Chat = new Schema({
    name: {type: String},
    creator: {type: ObjectId, ref: 'User'},
    users: [{type: ObjectId, ref: 'User'}],
    leave: [{type: ObjectId, ref: 'User'}],
    type: {type: String},
    notify: [{type: ObjectId, ref: 'User'}]
})

module.exports = model('Chat', Chat);