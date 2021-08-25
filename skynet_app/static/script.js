
let myid = '';
const socket = io("/", { transports: ["websocket"] });
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

// let peer = new Peer(undefined, {
//     secure: true
// });
var peer = new Peer({
    config: {'iceServers': [
        // { url: 'stun:stun.l.google.com:19302' },
        { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username:'webrtc@live.com' }
    ]}
});
// username = prompt('Human, what is your name?')


//when a user is connected to the peer server
//adding video
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.addEventListener('loadedmetadata', () => {
        video.play();
        videoGrid.append(video);
        
    })
}

function connect(userId, stream) {
    console.log('new user detected!');
    const video = document.createElement("video");
    call = peer.call(userId, stream);
    console.log('called new user')
    call.on("stream", userStream => {
        console.log(call.open)
        console.log('adding video stream!');
        addVideoStream(video, userStream);
    })
    
    socket.on('removal', ()=>{
        console.log('detected user removal request');
        video.remove();
        call.close();
    })
}
peer.on("open", id => { 
    console.log("peer connection open!");
    myid = id;
    console.log(myid);
    socket.emit("join-room", ROOM_ID, id);
})

navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
.then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    socket.on("user-connected", userId => {
        if (userId != myid) {
            console.log(`connecting to user: ${userId}`)
            connect(userId, stream);
        }
    })

    peer.on("call", call => {
        call.answer(stream);
        console.log('getting called!');
        const video = document.createElement("video");
        call.on("stream", userStream => {
            addVideoStream(video, userStream);
        })
    })
    
    
    document.getElementById('close').onclick = () => {
        console.log('emmiting event');
        socket.emit('client-disconnect-request');
    }
    
    socket.on('redirect-home', ()=>{
        window.location.href ='/';
    })
});


text = document.querySelector('#chat_message');
send = document.getElementById("send");
messages = document.querySelector('.messages');

send.addEventListener('click', ()=> {
    if (text.value.length != 0) {
        socket.emit("message", text.value);
        text.value='';
        console.log("message emitted!");
    }
})

text.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' && text.value.length != 0) {
        socket.emit("message", text.value);
        text.value='';
        console.log("message emitted!");
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


const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});