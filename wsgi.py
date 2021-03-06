from threading import Timer
from skynet_app import app
from flask import render_template, redirect, request
from flask_socketio import SocketIO, join_room, leave_room, send, emit, disconnect
from uuid import uuid4
socketio = SocketIO(app, cors_allowed_origins='*')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process-join', methods=['post'])
def processJoin():
    roomName = request.form['room']
    print(roomName)
    return redirect(f'/{roomName}')

@app.route('/<roomId>')
def room(roomId):
    print(roomId)
    return render_template('room.html', roomId = roomId)


@socketio.on('join-room')
def joinNewRoom(roomId, userId):
    print('join room requrest received!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    join_room(roomId)
    emit('user-connected', userId, broadcast = True, to=roomId)
    

@socketio.on('client-disconnect-request')
def disconnection(disconnectID, roomid):
    print('disconnection requet received, disconnecting the client')
    emit('removal', disconnectID, broadcast=True, to=roomid)
    emit('redirect-home')
    

@socketio.on('message')
def sendMessage(message, roomId):
    emit('create-message', message, broadcast=True, to=roomId)
    print('message received')



if __name__ == '__main__':
    socketio.run(app)
