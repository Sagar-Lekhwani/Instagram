const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({ 
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    msg:String,
}, {
    timestamps:true
}
);

module.exports = mongoose.model("message", messageSchema);