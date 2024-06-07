const { Schema, model } = require('mongoose');

const Post = new Schema({
    creator: Schema.Types.ObjectId,
    type: String,
    text: String,
    created: Date,
    edit: Boolean,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    files: [{ src: String, mimetype: String }]
}, { versionKey: false })

module.exports = model('Post', Post);