const { Schema, model, ObjectId } = require('mongoose');

const Album = new Schema({
    name: {type: String},
    user: {type: ObjectId, ref: 'User'}
})

module.exports = model('Album', Album);