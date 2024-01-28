const mongoose = require("mongoose");


const postSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    media:{
        type:String,
        default:'none',
    },
    data:{
        type:String,
        default:'none',
    },
    likes: [
        {type: mongoose.Schema.Types.ObjectId, ref: "user"}
    ],
    comments: [{
         text:String,
         postby:{type: mongoose.Schema.Types.ObjectId, ref: "user"},
             }],
    date: {
        type: Date,
        default: Date.now()
    },
    
})

module.exports = mongoose.model("post", postSchema);