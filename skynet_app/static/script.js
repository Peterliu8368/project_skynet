const ROOM_ID = "d9bf37c6-ab34-4153-8437-bf3bed93e275";

const socket = io("/", { transports: ["websocket"] });
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
let peer = new Peer(undefined, {
    secure: true
});
// username = prompt('Human, what is your name?')

//when a user is connected to the peer server
peer.on("open", id => { 
    console.log("peer connection open!")
    window.addEventListener('beforeunload', ()=> {
        socket.emit("client-disconnect-request")
    })
    socket.emit("join-room", ROOM_ID, id)
})
//adding video
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
        videoGrid.append(video)

    })
}

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
.then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", call => {
        call.answer(stream);
        const video = document.createElement("video")
        call.on("stream", userStream => {
            addVideoStream(video, userStream);
        })
        socket.on('removal', ()=>{
            console.log('detected user removal request')
            video.remove()
        })
    })
    
    socket.on("user-connected", userId => {
        console.log('new user detected!')
        const call = peer.call(userId, stream)
        console.log(call)
        const video = document.createElement("video")
        call.on("stream", userStream => {
            console.log('adding video stream!')
            addVideoStream(video, userStream);
        })

        socket.on('removal', ()=>{
            console.log('detected user removal request')
            video.remove()
            call.close()
        })
    })

    document.getElementById('close').onclick = () => {
        console.log('emmiting event')
        socket.emit('client-disconnect-request')
    }

    socket.on('redirect-home', ()=>{
        window.location.href ='/';
    })
});


text = document.querySelector('#chat_message')
send = document.getElementById("send")
messages = document.querySelector('.messages')

send.addEventListener('click', ()=> {
    if (text.value.length != 0) {
        socket.emit("message", text.value)
        text.value=''
        console.log("message emitted!")
    }
})

text.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' && text.value.length != 0) {
        socket.emit("message", text.value)
        text.value=''
        console.log("message emitted!")
    }
})


socket.on('create-message', message => {
    console.log('start creating message')
    messages.innerHTML = messages.innerHTML + 
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> User </span> </b>
        <span>${message}</span>
    </div>`;
})

//debug tool
socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});
