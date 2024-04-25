const { Schema, model } = require('mongoose');

const Comment = new Schema({
    post: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    text: String,
    created: Date,
    edit: Boolean,
    answer: Schema.Types.ObjectId,
    type: String,
    filename: String,
    mimetype: String
}, { versionKey: false })

module.exports = model('Comment', Comment);