let myid = '';
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

// var peer = new Peer({
//     secure: true
// });

var peer = new Peer({
    config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username:'webrtc@live.com' }
    ]},
    secure: true 
})
// username = prompt('Human, what is your name?')

callList = {};
videoList = {};
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
    console.log('called new user');
    
    call.on("stream", userStream => {
        if (!callList[call.peer]) {
            console.log(call.open)
            console.log('adding video stream!');
            addVideoStream(video, userStream);
            
            callList[call.peer] = call;
            videoList[call.peer] = video;
        }
    })
    
    console.log(peer.connections)
    socket.on('removal', (disconnectID)=>{
        console.log(`detected user removal request, start deleting ${disconnectID}`);
        delete callList[disconnectID];
        video.remove();
        call.close();
    })
}

setInterval(checkConnection, 1000);

function checkConnection() {
    for (let [key, value] of Object.entries(callList)) {
        console.log(`checking connection... it is currently ${value.open}`)
        if (value.open != true) {
            console.log('detected disconnected user, removing video')
            videoList[key].remove();
        }
    }
}

// open peer connection open, sending info to server
peer.on("open", id => { 
    console.log("peer connection open!");
    myid = id;
    console.log(myid);
    socket.emit("join-room", ROOM_ID, id);
})
let myVideoStream;
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
            setTimeout(connect,3000, userId, stream)
            // connect(userId, stream);
        }
    })

    document.getElementById('close').onclick = () => {
        console.log('emmiting event');
        socket.emit('client-disconnect-request', myid, ROOM_ID);
    }
    
    socket.on('redirect-home', ()=>{
        window.location.href ='/';
    })


    peer.on("call", call => {
        call.answer(stream);
        console.log('getting called!');
        call.peerConnection.onaddstream = function (event) {
            console.log('running add stream code')
            call.addStream (event.stream, call);
        }
        const video = document.createElement("video");
        call.on("stream", userStream => {
            addVideoStream(video, userStream);
        })
        //duplicate code to make sure it works
        document.getElementById('close').onclick = () => {
            console.log('emmiting event');
            socket.emit('client-disconnect-request', myid, ROOM_ID);
        }
        socket.on('removal', (disconnectID)=>{
            console.log(`detected user removal request, start deleting ${disconnectID}`);
            delete callList[disconnectID];
            video.remove();
            call.close();
        })
    })
    
});

// message section
text = document.querySelector('#chat_message');
send = document.getElementById("send");
messages = document.querySelector('.messages');

send.addEventListener('click', ()=> {
    if (text.value.length != 0) {
        socket.emit("message", text.value, ROOM_ID);
        text.value='';
        console.log("message emitted!");
    }
})

text.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' && text.value.length != 0) {
        socket.emit("message", text.value, ROOM_ID);
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

// mute audio / video section
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

//invite
inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});