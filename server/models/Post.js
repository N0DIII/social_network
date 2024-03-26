const { Schema, model, ObjectId } = require('mongoose');

const Post = new Schema({
    user: {type: ObjectId, ref: 'User'},
    group: {type: ObjectId, ref: 'Group'},
    text: {type: String},
    created: {type: Date},
    edit: {type: Boolean},
    type: {type: String}
})

module.exports = model('Post', Post);