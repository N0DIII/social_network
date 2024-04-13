const { Schema, model } = require('mongoose');

const Like = new Schema({
    post: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId
}, { versionKey: false })

module.exports = model('Like', Like);