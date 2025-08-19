const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date:{
        type:Date,
        default: Date.now
    },
    yesterday:{
        type:String,
        required: true
    },
    today:{
        type:String,
        required: true
    },
    blockers:{
        type:String,
        required: true
    }
})


module.exports = mongoose.model('Log', logSchema);