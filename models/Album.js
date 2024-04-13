const { Schema, model } = require('mongoose');

const Album = new Schema({
    name: String,
    user: Schema.Types.ObjectId
}, { versionKey: false })

module.exports = model('Album', Album);