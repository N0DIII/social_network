const { Schema, model } = require('mongoose');

const GroupCategories = new Schema({
    name: String
}, { versionKey: false })

module.exports = model('GroupCategories', GroupCategories);