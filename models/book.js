const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({

    title : {
        type : String,
        required : true,
        unique : true 
    },
    desc : {
        type : String,
        required : true,
    },
    photo : {
        type : String,
        required : false
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    category : {
        type : Array,
        required : false
    },

},{ timestamps : true });


module.exports = mongoose.model('Book', bookSchema);