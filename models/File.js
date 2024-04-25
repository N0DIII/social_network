const { Schema, model } = require('mongoose');

const File = new Schema({
    album: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    post: Schema.Types.ObjectId,
    type: String,
    name: String
}, { versionKey: false })

module.exports = model('File', File);