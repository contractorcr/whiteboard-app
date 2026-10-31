require('dotenv').config();
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Canvas = require('./models/canvasmodel');

const secret = process.env.secret;

function initSockets(server) {
    const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL },
    maxHttpBufferSize: 1e7,
});

    // Runs once per connection: check the token, remember who this is
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            const decoded = jwt.verify(token, secret);
            socket.userEmail = decoded.email;
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        // The client asks to enter a canvas's room
        socket.on('join-canvas', async (canvasId, ack) => {
            try {
                await Canvas.getcanvasbyid(socket.userEmail, canvasId);

                socket.join(canvasId);
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        // The client sends the full, updated drawing
        socket.on('update-elements', async (payload, ack) => {
            try {
                const { canvasId, elements } = payload || {};

                if (!Array.isArray(elements) || !elements.every((e) => e && typeof e === 'object')) {
                    throw new Error('Invalid elements');
                }

                const saved = await Canvas.saveelements(socket.userId, canvasId, elements);
                if (!saved) {
                    throw new Error('Not allowed');
                }

                // Everyone in the room except the sender
                socket.to(canvasId).emit('elements-updated', elements);
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });
    });
}

module.exports = initSockets;