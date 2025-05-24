// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); // Correct import for Socket.IO v3/v4

const app = express();
const server = http.createServer(app);

// Room Management
let activeRooms = {}; // Key: roomId, Value: { players: [], capacity: 4, gameStarted: false }
const MAX_PLAYERS_PER_ROOM = 4; // Standard Ludo max players
const MIN_PLAYERS_TO_START = 2; // Minimum players to start the game
const PLAYER_COLORS_ORDER = ['RED', 'GREEN', 'YELLOW', 'BLUE']; // Order of color assignment

function generateRoomId(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity during development
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Basic route to serve the game client (optional for now, but good structure)
// This assumes your Ludo game HTML/CSS/JS are in a 'public' directory
// app.use(express.static('public')); 

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send a welcome message to the connected client
  socket.emit('welcome_message', { 
    message: 'Welcome to Ludo Multiplayer! You are connected.',
    clientId: socket.id 
  });

  socket.on('createRoom', () => {
    let newRoomId = generateRoomId();
    // Ensure roomId is unique (highly unlikely to collide with 5 chars, but good practice for larger scale)
    while(activeRooms[newRoomId]) {
        newRoomId = generateRoomId();
    }

    activeRooms[newRoomId] = {
        roomId: newRoomId,
        players: [{ id: socket.id, name: `Player-${socket.id.substring(0,3)}` /* placeholder name */ }],
        capacity: MAX_PLAYERS_PER_ROOM,
        gameStarted: false
    };
    socket.join(newRoomId);
    console.log(`User ${socket.id} created and joined room: ${newRoomId}`);
    socket.emit('roomCreated', { roomId: newRoomId, playerId: socket.id, players: activeRooms[newRoomId].players, roomCapacity: activeRooms[newRoomId].capacity });

    // If min players is 1, game could start here too.
    if (!activeRooms[newRoomId].gameStarted && activeRooms[newRoomId].players.length >= MIN_PLAYERS_TO_START) {
        // (Similar game start logic as in joinRoom - can be refactored into a function)
        // For now, focusing on joinRoom triggering start for 2 players.
        // This part could be enhanced later if a 1-player start (vs AI or self) is needed via multiplayer flow.
    }
  });

  socket.on('joinRoom', (roomId) => {
    const room = activeRooms[roomId];
    if (!room) {
        socket.emit('roomNotFound', { message: `Room ${roomId} not found.` });
        return;
    }

    // Prevent joining if already started and full, or simply if started
    if (room.gameStarted) {
         socket.emit('gameAlreadyStarted', { message: `Game in room ${roomId} has already started.`});
         return;
    }
    if (room.players.length >= room.capacity) {
        socket.emit('roomFull', { message: `Room ${roomId} is full.` });
        return;
    }

    const newPlayer = { id: socket.id, name: `Player-${socket.id.substring(0,3)}` };
    room.players.push(newPlayer);
    socket.join(roomId);
    
    console.log(`User ${socket.id} joined room: ${roomId}. Players in room: ${room.players.length}`);
    
    socket.emit('joinedRoom', { roomId: roomId, playerId: socket.id, players: room.players, roomCapacity: room.capacity });
    socket.to(roomId).emit('playerJoined', { player: newPlayer, playersInRoom: room.players });

    // Check if game can start
    if (!room.gameStarted && room.players.length >= MIN_PLAYERS_TO_START) {
        room.gameStarted = true;
        // Assign colors and determine starting player
        room.players.forEach((player, index) => {
            player.color = PLAYER_COLORS_ORDER[index];
            player.playerNum = index + 1; // e.g., Player 1, Player 2
        });

        const startingPlayer = room.players[0]; // First player to join starts

        // Send gameStart event to all clients in the room
        io.to(roomId).emit('gameStart', {
            message: 'Game is starting!',
            roomId: roomId,
            players: room.players, // Full list of players with assigned colors
            startingPlayerId: startingPlayer.id,
            startingPlayerColor: startingPlayer.color
        });
        console.log(`Game started in room ${roomId} with players:`, room.players);
    }
  });
  
  // Handle disconnect: remove player from any room they might be in
  
  socket.on('diceRolled', (data) => {
    const { roomId, playerId } = data;
    const room = activeRooms[roomId];

    if (!room) {
        console.error(`Room ${roomId} not found for dice roll from ${playerId}`);
        // socket.emit('error', { message: 'Room not found.' }); // Optional: send error back
        return;
    }

    // Basic validation: Is it this player's turn? (More advanced validation later)
    // For now, assume client-side turn enforcement is mostly working.
    // The server should be the ultimate authority on whose turn it is.
    // We'll add proper server-side turn tracking linked to player IDs later.
    // For now, we trust the client that emitted 'diceRolled' is the current player.

    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    // Find player name/color for better broadcast message
    const roller = room.players.find(p => p.id === playerId);
    const rollerName = roller ? roller.name : playerId.substring(0,3);
    const rollerColor = roller ? roller.color : ''; // Ensure color is available

    console.log(`Player ${rollerName} (${rollerColor || 'N/A'}) in room ${roomId} rolled a ${diceValue}`);

    // Broadcast to all in room (including sender, who will also update UI via 'diceBroadcast')
    io.to(roomId).emit('diceBroadcast', {
        diceValue: diceValue,
        rollerId: playerId, // The socket ID of who rolled
        rollerName: rollerName, // Player's name/identifier
        rollerColor: rollerColor // Player's color
    });
    
    // Server should also manage whose turn it is to roll next, especially after a 6.
    // This will be part of more robust server-side turn management.
  });

  socket.on('tokenMoved', (data) => {
    const { roomId, playerId, tokenId, targetCellId, isActivation, diceValueUsed, capturedTokenInfo, currentCellId } = data;
    const room = activeRooms[roomId];

    if (!room) {
        console.error(`Room ${roomId} not found for token move from ${playerId}`);
        return;
    }

    // TODO: Server-side validation of the move (is it player's turn? is move valid by rules?)
    // For now, we trust the client's validated move.

    console.log(`Token move in room ${roomId} by ${playerId}: ${tokenId} from ${currentCellId} to ${targetCellId}`);
    if (isActivation) console.log (`  (Activation move with a ${diceValueUsed})`);
    if (capturedTokenInfo) console.log(`  Captured: ${capturedTokenInfo.id}`);

    // Broadcast the move to all clients in the room, including the sender.
    // The sender will also use this to confirm and finalize its UI.
    io.to(roomId).emit('playerMoveBroadcasted', {
        movedTokenId: tokenId,
        newCellId: targetCellId,
        isActivationMove: isActivation, // True if it was a move from home
        captureData: capturedTokenInfo, // { id: 'capturedTokenId', homeCellId: 'itsHomeCellId' } or null
        rollerId: playerId, // Who made the move (socket.id)
        wasSixRoll: (diceValueUsed === 6) // Whether the dice roll that led to this move was a 6
    });

    // Server needs to manage whose turn it is next.
    // If diceValueUsed was 6, it's still playerId's turn to roll.
    // Otherwise, switch to next player in room.players order.
    // This will be handled by a separate 'updateTurn' broadcast in a more robust setup.
    // For now, client-side logic for re-enabling dice for current player on a 6 is okay.
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in activeRooms) {
        const room = activeRooms[roomId];
        const playerIndex = room.players.findIndex(player => player.id === socket.id);
        if (playerIndex !== -1) {
            const removedPlayer = room.players.splice(playerIndex, 1)[0];
            console.log(`Player ${removedPlayer.name} removed from room ${roomId}`);
            // Notify other players in the room
            io.to(roomId).emit('playerLeft', { playerId: socket.id, name: removedPlayer.name, playersInRoom: room.players });

            if (room.players.length === 0) {
                console.log(`Room ${roomId} is empty, deleting.`);
                delete activeRooms[roomId];
            }
            break; // Assuming player can only be in one room
        }
    }
  });

  // Example: Listen for a message from client (not required by this subtask but good for demo)
  // socket.on('client_message', (data) => {
  //   console.log(`Message from ${socket.id}: ${data.text}`);
  //   // Broadcast to others or respond
  // });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
