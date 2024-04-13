const { Schema, model } = require('mongoose');

const Group = new Schema({
    name: String,
    creator: Schema.Types.ObjectId,
    created: Date,
    users: [Schema.Types.ObjectId]
}, { versionKey: false })

module.exports = model('Group', Group);