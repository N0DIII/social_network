const { Schema, model, ObjectId } = require('mongoose');

const Like = new Schema({
    post: {type: ObjectId, ref: 'Post'},
    user: {type: ObjectId, ref: 'User'}
})

module.exports = model('Like', Like);