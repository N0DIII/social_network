const { Schema, model, ObjectId } = require('mongoose');

const Comment = new Schema({
    post: {type: ObjectId, ref: 'Post'},
    user: {type: ObjectId, ref: 'User'},
    text: {type: String},
    created: {type: Date},
    edit: {type: Boolean},
    answer: {type: ObjectId, ref: 'Comment'}
})

module.exports = model('Comment', Comment);