const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    username : {
        type : String,
        required : true,
        unique : true,
        length : {
            minimize : 5
        }
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    posts : [{
        type : Schema.Types.ObjectId,
        ref : 'Book'
    }]
},{timestamps : true});


module.exports = mongoose.model('User', userSchema);