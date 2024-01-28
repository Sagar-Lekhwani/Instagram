const mongoose = require("mongoose");

const storySchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    media:{
        type:String,
        default:'none',
    },
    data: String,
    likes: [
        {type: mongoose.Schema.Types.ObjectId, ref: "user"}
    ],
    date: {
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model("story", storySchema);