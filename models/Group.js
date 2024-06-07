const { Schema, model } = require('mongoose');

const Group = new Schema({
    name: { type: String, unique: true },
    creator: Schema.Types.ObjectId,
    admins: [Schema.Types.ObjectId],
    created: Date,
    description: String,
    category: String,
    userCount: { type: Number, default: 0 },
    avatar: String,
}, { versionKey: false })

module.exports = model('Group', Group);