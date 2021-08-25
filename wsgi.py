from skynet_app import app
from flask import render_template, redirect, request
from flask_socketio import SocketIO, join_room, leave_room, send, emit, disconnect
from uuid import uuid4
socketio = SocketIO(app, cors_allowed_origins='*')

users = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process-join', methods=['post'])
def processJoin():
    roomName = request.form['room']
    return redirect(f'/{roomName}')

@app.route('/<roomId>')
def room(roomId):
    return render_template('room.html', roomId = roomId)


@socketio.on('join-room')
def joinNewRoom(roomId, userId):
    print('join room requrest received!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print(f'joining room {roomId}')
    join_room(roomId)
    users[id] = roomId
    emit('user-connected', userId, broadcast = True, to=roomId)
    

@socketio.on('client-disconnect-request')
def disconnection():
    print('disconnection requet received, disconnecting the client')
    emit('removal', broadcast=True)
    emit('redirect-home')
    

@socketio.on('message')
def sendMessage(message):
    emit('create-message', message, broadcast=True)
    print('message received')

if __name__ == '__main__':
    socketio.run(app)
