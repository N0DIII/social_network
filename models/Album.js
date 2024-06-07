const { Schema, model } = require('mongoose');

const Album = new Schema({
    name: { type: String, default: 'Без названия' },
    user: Schema.Types.ObjectId,
    files: [{ src: String, mimetype: String }]
}, { versionKey: false })

module.exports = model('Album', Album);