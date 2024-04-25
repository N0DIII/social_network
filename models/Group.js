const { Schema, model } = require('mongoose');

const Group = new Schema({
    name: String,
    creator: Schema.Types.ObjectId,
    admins: [Schema.Types.ObjectId],
    created: Date,
    description: String,
    categories: [String],
    users: { type: Number, default: 0 }
}, { versionKey: false })

module.exports = model('Group', Group);