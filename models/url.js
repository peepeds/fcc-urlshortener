const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true,
        unique: true
    },
    access: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const urlModel = mongoose.model('url', urlSchema);

module.exports = {
    urlModel,
    urlSchema
}