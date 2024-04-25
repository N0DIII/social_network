const { Schema, model } = require('mongoose');

const GroupCategories = new Schema({
    _id: String
}, { versionKey: false })

module.exports = model('GroupCategories', GroupCategories);