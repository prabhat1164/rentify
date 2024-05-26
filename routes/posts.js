const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: Array,
        default: []
    },
    place: {
        type:String,
        require:true
    },
    area: {
        type:String,
        required:true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    nearbyHospital: {
        type: String
    },
    nearbyMall: {
        type: String
    },
    bathrooms: {
        type: Number,
        required: true
    },
    nearbyCollege: {
        type: String
    },
    rent: {
        type: Number,
        requirede:true
    }
});

module.exports = mongoose.model('Post',postSchema);