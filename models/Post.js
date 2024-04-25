const { Schema, model } = require('mongoose');

const Post = new Schema({
    user: Schema.Types.ObjectId,
    group: Schema.Types.ObjectId,
    text: String,
    created: Date,
    edit: Boolean,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    type: String
}, { versionKey: false })

module.exports = model('Post', Post);