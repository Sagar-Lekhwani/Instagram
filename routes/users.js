const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/instagram");
// mongoose.connect("mongodb+srv://sgrlekhwani:Q7eCct3WlgKaRcVQ@cluster0.hchs4wp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");


const userSchema = mongoose.Schema({

  Fullname: String,
  username: String,
  password: String,
  posts: [
    {type: mongoose.Schema.Types.ObjectId, ref: "post"}
  ],
  stories: [
    {type: mongoose.Schema.Types.ObjectId, ref: "story"}
  ],
  followers: [
    {type: mongoose.Schema.Types.ObjectId, ref: "user"}
  ],
  following: [
    {type: mongoose.Schema.Types.ObjectId, ref: "user"}
  ],
  email: String,
  image: {
    type: String,
    default: 'def.png'
  },
  is_online:{
    type: Boolean,
    default: false
  },
  private:{
    type: Boolean,
    default: false
  },
  
},
 {
  timestamps:true,
})

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);