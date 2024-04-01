const { Schema, model, ObjectId } = require('mongoose');

const Message = new Schema({
    text: {type: String},
    chat: {type: ObjectId, ref: 'Chat'},
    user: {type: ObjectId, ref: 'User'},
    created: {type: Date},
    edit: {type: Boolean},
    type: {type: String},
    replay: {type: ObjectId, ref: 'Message'},
    filename: {type: String}
})

module.exports = model('Message', Message);