import socketio
from skynet_app import app
from socketio import SocketIO
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app)