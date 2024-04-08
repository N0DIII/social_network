const { Schema, model, ObjectId } = require('mongoose');

const Photo = new Schema({
    album: {type: ObjectId, ref: 'Album'},
    user: {type: ObjectId, ref: 'User'},
    type: {type: String},
    name: {type: String}
})

module.exports = model('Photo', Photo);