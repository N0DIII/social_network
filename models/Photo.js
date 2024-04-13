const { Schema, model } = require('mongoose');

const Photo = new Schema({
    album: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    type: String,
    name: String
}, { versionKey: false })

module.exports = model('Photo', Photo);