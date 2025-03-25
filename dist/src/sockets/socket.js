export const handleSocketConnection = (io) => {
    io.on('connection', (socket) => {
        console.log('socketId: ', socket.id);
    });
    io.on('disconnect', (socket) => {
        console.log('socket disconnected');
    });
};
//# sourceMappingURL=socket.js.map