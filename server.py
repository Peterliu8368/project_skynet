from skynet_app import app
from flask import render_template, redirect
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from uuid import uuid4
socketio = SocketIO(app)


@app.route('/')
def index():
    return redirect(f'/{uuid4()}')

@app.route('/<roomId>')
def room(roomId):
    return render_template('room.html', roomId = roomId)

@socketio.on('join-room')
def joinNewRoom(roomId, userId):
    join_room(roomId)
    emit('user-connected', userId, broadcast=True, to=roomId)

# @socketio.on('leave')
# def disconnectUser(userId, roomId):
#     emit('user-offline', userId, roomId, broadcast=True, to=roomId)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
