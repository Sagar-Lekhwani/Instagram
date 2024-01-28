const io = require( "socket.io" )();
var userModel = require('./routes/users');
const messageModel = require('./routes/message');
const socketapi = {
    io: io
};

var usp = io.of('/user-namespace');

// Add your socket.io logic here!
usp.on( "connection", async function( socket ) {
    console.log( "A user connected" );

    var userId = socket.handshake.auth.token;
    await userModel.findByIdAndUpdate({_id:userId},{$set: {is_online: true}});

    socket.broadcast.emit('getonlineuser', {user_id:userId});
    
    
    socket.on('disconnect', async function() {
        console.log('user disconnected');
        
        var userId = socket.handshake.auth.token;
        await userModel.findByIdAndUpdate({_id:userId},{$set: {is_online: false}});
    
        socket.broadcast.emit('getofflineuser', {user_id:userId});
    });

    socket.on('newchat', function(data) {
        socket.broadcast.emit('loadnewchat',data);
    })

    socket.on('existschats',async function(data) {
        var chats = await messageModel.find({ $or: [
            {senderId:data.senderId,recieverId:data.recieverId},
            {senderId:data.recieverId,recieverId:data.senderId}
        ]});
        socket.emit( 'loadchats',{chats:chats});
    })
});

// end of socket.io logic

module.exports = socketapi;