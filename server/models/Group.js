const { Schema, model, ObjectId } = require('mongoose');

const Group = new Schema({
    name: {type: String},
    users: [{type: ObjectId, ref: 'User'}]
})

module.exports = model('Group', Group);