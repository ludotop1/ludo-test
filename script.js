// Add to the top of script.js or within an init function
const diceDisplay = document.getElementById('dice-display');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const gameMessage = document.getElementById('game-message');
const playerTurnIndicator = document.getElementById('player-turn-indicator'); 

let currentRoomIdDisplay, roomIdInput, joinRoomBtn, createRoomBtn, playerListDisplay;
const MIN_PLAYERS_TO_START = 2; // Define globally for access in event handlers

let currentDiceRoll = 0;
let rolledSix = false;
let isGameOver = false; // Tracks if the game has ended

// Player and Turn Management
const playerColors = ['RED', 'GREEN', 'YELLOW', 'BLUE']; // All possible player colors
let activePlayers = ['RED', 'GREEN', 'YELLOW', 'BLUE']; // Players currently in the game - Updated to include all for token setup
let currentPlayerIndex = 0; // Index for activePlayers
let currentPlayerId = activePlayers[currentPlayerIndex]; // Current active player

// Token and Path Data
const LUDO_PATHS = {
    RED: {
        mainPath: [
            "cell-91", "cell-92", "cell-93", "cell-94", "cell-95", // (6,1) to (6,5)
            "cell-81", "cell-66", "cell-51", "cell-36", "cell-21", "cell-6", // (5,6) to (0,6)
            "cell-7", // (0,7)
            "cell-8", // (0,8) - Green's column
            "cell-23", "cell-38", "cell-53", "cell-68", "cell-83", // (1,8) to (5,8)
            "cell-99", "cell-100", "cell-101", "cell-102", "cell-103", "cell-104", // (6,9) to (6,14)
            "cell-119", // (7,14)
            "cell-134", // (8,14) - Yellow's row
            "cell-133", "cell-132", "cell-131", "cell-130", "cell-129", // (8,13) to (8,9)
            "cell-144", "cell-159", "cell-174", "cell-189", "cell-204", "cell-219", // (9,9) to (14,9) - Yellow's column (Note: these are col 9, not col 8)
            "cell-218", // (14,8) - Cell before Blue's column. This makes previous segment end on (14,9) i.e. cell-219
            "cell-216", // (14,6) - Blue's column
            "cell-201", "cell-186", "cell-171", "cell-156", "cell-141", // (13,6) to (9,6)
            "cell-125", "cell-124", "cell-123", "cell-122", "cell-121", "cell-120", // (8,5) to (8,0)
            "cell-105"  // (7,0) - Last cell of Red's main path
        ],
        homeStretch: [ // (7,1) to (7,6)
            "cell-106", "cell-107", "cell-108", "cell-109", "cell-110", "cell-111"
        ],
        completePath: [],
        entryCell: ""
    },
    GREEN: {
        mainPath: [
            "cell-23", "cell-38", "cell-53", "cell-68", "cell-83", // (1,8) to (5,8)
            "cell-99", "cell-100", "cell-101", "cell-102", "cell-103", "cell-104", // (6,9) to (6,14)
            "cell-119", // (7,14)
            "cell-134", // (8,14)
            "cell-133", "cell-132", "cell-131", "cell-130", "cell-129", // (8,13) to (8,9)
            "cell-144", "cell-159", "cell-174", "cell-189", "cell-204", "cell-219", // (9,9) to (14,9)
            "cell-218", // (14,8)
            "cell-216", // (14,6)
            "cell-201", "cell-186", "cell-171", "cell-156", "cell-141", // (13,6) to (9,6)
            "cell-125", "cell-124", "cell-123", "cell-122", "cell-121", "cell-120", // (8,5) to (8,0)
            "cell-105", // (7,0)
            "cell-91", "cell-92", "cell-93", "cell-94", "cell-95", // (6,1) to (6,5)
            "cell-81", "cell-66", "cell-51", "cell-36", "cell-21", "cell-6", // (5,6) to (0,6)
            "cell-7"    // (0,7) - Last cell of Green's main path
        ],
        homeStretch: [ // (1,7) to (6,7)
            "cell-22", "cell-37", "cell-52", "cell-67", "cell-82", "cell-97"
        ],
        completePath: [],
        entryCell: ""
    },
    YELLOW: {
        mainPath: [
            "cell-133", "cell-132", "cell-131", "cell-130", "cell-129", // (8,13) to (8,9)
            "cell-144", "cell-159", "cell-174", "cell-189", "cell-204", "cell-219", // (9,9) to (14,9)
            "cell-218", // (14,8)
            "cell-216", // (14,6)
            "cell-201", "cell-186", "cell-171", "cell-156", "cell-141", // (13,6) to (9,6)
            "cell-125", "cell-124", "cell-123", "cell-122", "cell-121", "cell-120", // (8,5) to (8,0)
            "cell-105", // (7,0)
            "cell-91", "cell-92", "cell-93", "cell-94", "cell-95", // (6,1) to (6,5)
            "cell-81", "cell-66", "cell-51", "cell-36", "cell-21", "cell-6", // (5,6) to (0,6)
            "cell-7", // (0,7)
            "cell-8", // (0,8)
            "cell-23", "cell-38", "cell-53", "cell-68", "cell-83", // (1,8) to (5,8)
            "cell-99", "cell-100", "cell-101", "cell-102", "cell-103", "cell-104", // (6,9) to (6,14)
            "cell-119"  // (7,14) - Last cell of Yellow's main path
        ],
        homeStretch: [ // (7,13) to (7,8)
            "cell-118", "cell-117", "cell-116", "cell-115", "cell-114", "cell-113"
        ],
        completePath: [],
        entryCell: ""
    },
    BLUE: {
        mainPath: [
            "cell-201", "cell-186", "cell-171", "cell-156", "cell-141", // (13,6) to (9,6)
            "cell-125", "cell-124", "cell-123", "cell-122", "cell-121", "cell-120", // (8,5) to (8,0)
            "cell-105", // (7,0)
            "cell-91", "cell-92", "cell-93", "cell-94", "cell-95", // (6,1) to (6,5)
            "cell-81", "cell-66", "cell-51", "cell-36", "cell-21", "cell-6", // (5,6) to (0,6)
            "cell-7", // (0,7)
            "cell-8", // (0,8)
            "cell-23", "cell-38", "cell-53", "cell-68", "cell-83", // (1,8) to (5,8)
            "cell-99", "cell-100", "cell-101", "cell-102", "cell-103", "cell-104", // (6,9) to (6,14)
            "cell-119", // (7,14)
            "cell-134", // (8,14)
            "cell-133", "cell-132", "cell-131", "cell-130", "cell-129", // (8,13) to (8,9)
            "cell-144", "cell-159", "cell-174", "cell-189", "cell-204", "cell-219", // (9,9) to (14,9)
            "cell-218" // (14,8) - Last cell of Blue's main path
        ],
        homeStretch: [ // (13,7) to (8,7)
            "cell-202", "cell-187", "cell-172", "cell-157", "cell-142", "cell-127"
        ],
        completePath: [],
        entryCell: ""
    }
};

// Ensure the initializePaths function is correctly defined and called *after* LUDO_PATHS
function initializePaths() {
    for (const color in LUDO_PATHS) {
        // Basic validation for path segment lengths
        if (LUDO_PATHS[color].mainPath.length !== 51) {
            console.error(`Path Definition Error: ${color} mainPath should be 51 cells long, but it is ${LUDO_PATHS[color].mainPath.length}. Please check path data.`);
        }
        if (LUDO_PATHS[color].homeStretch.length !== 6) {
            console.error(`Path Definition Error: ${color} homeStretch should be 6 cells long, but it is ${LUDO_PATHS[color].homeStretch.length}. Please check path data.`);
        }

        LUDO_PATHS[color].completePath = [
            ...LUDO_PATHS[color].mainPath,
            ...LUDO_PATHS[color].homeStretch
        ];

        if (LUDO_PATHS[color].completePath.length !== 57) {
            console.error(`Path Initialization Error: ${color} completePath is not 57 steps. It is ${LUDO_PATHS[color].completePath.length} steps. This usually indicates an issue with mainPath or homeStretch lengths.`);
        }
        // Entry cell is the first cell of their main path, which is also the first cell of the complete path.
        LUDO_PATHS[color].entryCell = LUDO_PATHS[color].mainPath[0]; 
    }
}

// Call initializePaths immediately after LUDO_PATHS is defined.
initializePaths(); 

console.log("LUDO_PATHS fully initialized:", LUDO_PATHS);
// Any other functions or event listeners that depend on LUDO_PATHS should come after this initialization.

function getPlayerTokens(playerId) {
    // Helper function to get all token IDs for a given player
    const tokens = [];
    for (let i = 1; i <= 4; i++) {
        tokens.push(`${playerId.toLowerCase()}-${i}`);
    }
    return tokens;
}

function checkWinCondition(playerId) {
    const playerTokens = getPlayerTokens(playerId);
    const victoryCell = LUDO_PATHS[playerId].completePath[56]; // Last cell of the path (0-indexed, 57 cells total)

    for (const tokenId of playerTokens) {
        if (tokenPositions[tokenId] !== victoryCell) {
            return false; // At least one token is not on the victory cell
        }
    }
    return true; // All 4 tokens are on the victory cell
}

// Entry cells are typically safe. Other safe cells will be added later.
// Defined based on LUDO_PATHS entry cells and 4 other common star cells from the CSS.
// This definition of FINAL_SAFE_CELLS should now use the initialized LUDO_PATHS
const FINAL_SAFE_CELLS = [
    LUDO_PATHS.RED.entryCell,
    LUDO_PATHS.GREEN.entryCell,
    LUDO_PATHS.YELLOW.entryCell,
    LUDO_PATHS.BLUE.entryCell,
    'cell-8',   // Example star cell (Ensure these are correct based on board design)
    'cell-36',  // Example star cell
    'cell-148', // Example star cell
    'cell-178'  // Example star cell
];

// Store initial home cells for each token
const tokenInitialHomeCells = {
    'red-1': 'cell-32', 'red-2': 'cell-33', 'red-3': 'cell-47', 'red-4': 'cell-48',
    'green-1': 'cell-41', 'green-2': 'cell-42', 'green-3': 'cell-56', 'green-4': 'cell-57',
    'yellow-1': 'cell-176', 'yellow-2': 'cell-177', 'yellow-3': 'cell-191', 'yellow-4': 'cell-192',
    'blue-1': 'cell-167', 'blue-2': 'cell-168', 'blue-3': 'cell-182', 'blue-4': 'cell-183',
};

// Track current position of each token. Key: tokenId, Value: cellId string or 'home' (though 'home' not used here, directly cellId)
let tokenPositions = {}; 

function updatePlayerTurnIndicator() {
    // Ensure playerTurnIndicator is not null before trying to set its properties
    if (playerTurnIndicator) {
        playerTurnIndicator.textContent = `Turn: Player ${playerColors.indexOf(currentPlayerId) + 1} (${currentPlayerId})`;
        // You might want to also change the color of the indicator
        // playerTurnIndicator.style.color = currentPlayerId.toLowerCase(); // If CSS colors are set up e.g. .red { color: red; }
    } else {
        console.error("playerTurnIndicator element not found!");
    }
}


rollDiceBtn.addEventListener('click', () => {
    if (isGameOver) return; // Prevent action if game is over

    currentDiceRoll = Math.floor(Math.random() * 6) + 1;
    
    if (diceDisplay) {
        diceDisplay.textContent = currentDiceRoll;
        diceDisplay.style.transform = 'rotate(360deg)'; // Simple animation
        setTimeout(() => { diceDisplay.style.transform = 'none'; }, 200);
    } else {
        console.error("diceDisplay element not found!");
    }

    if (gameMessage) {
        if (currentDiceRoll === 6) {
            gameMessage.textContent = "Rolled a 6! You get an extra turn.";
            rolledSix = true;
            // Actual extra turn logic will be handled by the turn management system
            // For now, this flag `rolledSix` can be checked by it.
        } else {
            gameMessage.textContent = "";
            rolledSix = false;
        }
    } else {
        console.error("gameMessage element not found!");
    }
    
    // Play dice roll sound (basic implementation)
    // This requires an audio file. For now, we'll skip the actual sound playing
    // but you can imagine an audio element being played here.
    // Example: const diceSound = new Audio('sounds/dice_roll.mp3'); diceSound.play();

    console.log(`Player ${currentPlayerId} rolled: ${currentDiceRoll}`);
    // Instead of instantly updating UI, emit to server, let server broadcast back.
    const roomId = document.getElementById('game-container').dataset.roomId;
    if (roomId && socket) { // Ensure socket is defined
        socket.emit('diceRolled', { roomId: roomId, playerId: socket.id /* Send who rolled */ });
        // Disable button immediately after emitting to prevent multiple clicks before server response
        rollDiceBtn.disabled = true; 
    } else {
        console.error("No roomId found or socket not initialized to emit dice roll.");
        // Fallback for local roll if needed, or handle error
        // For multiplayer, roomId should exist if game has started.
        // If socket is not defined here, it indicates a larger issue with initialization order.
    }
    // The actual dice roll display and game logic update will now be handled by 'diceBroadcast' listener
});

// Note: The original logic for setting gameMessage.textContent immediately after local roll is removed.
// It will now be set based on the 'diceBroadcast' from the server.
// The `currentDiceRoll` and `rolledSix` variables will also be set by 'diceBroadcast'.

// Existing:
// if (rolledSix) {
// ...
// } else {
// ...
// }
// This above block for local message update is removed as server broadcast will handle it.

function switchToNextPlayer() {
        // Player rolled a 6, gets another turn to roll.
        // They must move a token first if possible, then roll again.
        gameMessage.textContent = "Rolled a 6! Move your token, then roll again.";
        // rollDiceBtn.disabled = true; // Stays disabled until token is moved (already set above)
    } else {
        // Player did not roll a 6. Their turn will end after they move a token.
        gameMessage.textContent += " Select a token to move or pass turn if no move.";
        // rollDiceBtn.disabled = true; // Stays disabled until token is moved (already set above)
    }
});

function switchToNextPlayer() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= activePlayers.length) {
        currentPlayerIndex = 0;
    }
    currentPlayerId = activePlayers[currentPlayerIndex];
    updatePlayerTurnIndicator();
    
    currentDiceRoll = 0;
    if (diceDisplay) { // Check if diceDisplay is available
        diceDisplay.textContent = '0'; // Reset dice display
    }
    rolledSix = false; // Reset this flag for the new player
    if (gameMessage) { // Check if gameMessage is available
        gameMessage.textContent = ""; // Clear previous messages
    }
    if (rollDiceBtn) { // Check if rollDiceBtn is available
        rollDiceBtn.disabled = false; // Enable button for next player
    }
    console.log(`Turn switched to: ${currentPlayerId}`);
}

// Initialize
// DOM elements might not be available when script is just parsed if it's in <head> without defer
// Wrap in DOMContentLoaded listener to be safe
document.addEventListener('DOMContentLoaded', () => {
    // Re-fetch elements here if not using defer or if script is in head
    // For this project, script.js is at the end of body, so elements should be available.
    
    // Update current player ID based on activePlayers and currentPlayerIndex for initial setup
    currentPlayerId = activePlayers[currentPlayerIndex];
    updatePlayerTurnIndicator(); // Set initial player indicator

    initializeTokenPositions();
    setupTokenClickListeners();

    if (rollDiceBtn) {
        rollDiceBtn.disabled = false; // Ensure it's enabled at game start for the first player
    } else {
        console.error("Error: rollDiceBtn element not found during initial setup in DOMContentLoaded.");
    }

    // Check if elements were found (for debugging, can be removed in production)
    // These checks are good for ensuring the DOM is as expected.
    if (!diceDisplay) console.error("Error: diceDisplay element not found after DOMContentLoaded.");
    if (!rollDiceBtn) console.error("Error: rollDiceBtn element not found after DOMContentLoaded.");
    if (!gameMessage) console.error("Error: gameMessage element not found after DOMContentLoaded.");
    if (!playerTurnIndicator) console.error("Error: playerTurnIndicator element not found after DOMContentLoaded.");

    // Multiplayer connection attempt
    currentRoomIdDisplay = document.getElementById('current-room-id-display');
    roomIdInput = document.getElementById('room-id-input');
    joinRoomBtn = document.getElementById('join-room-btn');
    createRoomBtn = document.getElementById('create-room-btn');
    playerListDisplay = document.getElementById('player-list-display');

    // Event Listeners for new buttons
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            socket.emit('createRoom');
            createRoomBtn.disabled = true;
            joinRoomBtn.disabled = true;
            roomIdInput.disabled = true;
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const roomId = roomIdInput.value.trim().toUpperCase();
            if (roomId) {
                socket.emit('joinRoom', roomId);
                createRoomBtn.disabled = true;
                joinRoomBtn.disabled = true;
                roomIdInput.disabled = true;
            } else {
                alert("Please enter a Room ID.");
            }
        });
    }
    
    try {
        const socket = io('http://localhost:3000'); // Attempt to connect to the server

        socket.on('connect', () => {
            console.log('Connected to multiplayer server with ID:', socket.id);
            gameMessage.textContent = 'Connected to server! Create or Join a Room.'; 
            resetRoomButtons(); // Enable buttons on successful connection
        });

        socket.on('welcome_message', (data) => {
            console.log('Message from server:', data.message);
            const serverMsgDiv = document.createElement('div');
            serverMsgDiv.textContent = `Server: ${data.message} (My ID: ${socket.id})`;
            const uiPanel = document.getElementById('ui-panel');
            if (uiPanel) {
                uiPanel.prepend(serverMsgDiv);
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Connection to server failed:', err.message);
            gameMessage.textContent = 'Failed to connect to server.';
            // Disable room buttons if connection fails initially
            if(createRoomBtn) createRoomBtn.disabled = true;
            if(joinRoomBtn) joinRoomBtn.disabled = true;
            if(roomIdInput) roomIdInput.disabled = true;
        });

        socket.on('roomCreated', (data) => {
            console.log('Room created:', data);
            if(gameMessage) gameMessage.textContent = `Room ${data.roomId} created. Waiting for players...`;
            if(currentRoomIdDisplay) currentRoomIdDisplay.textContent = data.roomId;
            const gameContainer = document.getElementById('game-container');
            if(gameContainer) gameContainer.dataset.roomId = data.roomId;
            updatePlayerListUI(data.players);
            // Buttons remain disabled as we are now in a 'waiting' state in a room
        });

        socket.on('joinedRoom', (data) => {
            console.log('Joined room:', data);
            if(gameMessage) gameMessage.textContent = `Joined room ${data.roomId}. Players: ${data.players.length}/${data.roomCapacity}`;
            if(currentRoomIdDisplay) currentRoomIdDisplay.textContent = data.roomId;
            const gameContainer = document.getElementById('game-container');
            if(gameContainer) gameContainer.dataset.roomId = data.roomId;
            updatePlayerListUI(data.players);
            if(createRoomBtn) createRoomBtn.disabled = true;
            if(joinRoomBtn) joinRoomBtn.disabled = true;
            if(roomIdInput) roomIdInput.disabled = true;
        });
        
        socket.on('playerJoined', (data) => { 
            console.log('Another player joined:', data);
            if(gameMessage) gameMessage.textContent = `${data.player.name} joined. Players: ${data.playersInRoom.length}`;
            updatePlayerListUI(data.playersInRoom);
        });

        socket.on('playerLeft', (data) => { 
            console.log('A player left:', data);
            if(gameMessage) gameMessage.textContent = `${data.name} left. Players: ${data.playersInRoom.length}`;
            updatePlayerListUI(data.playersInRoom);
            if (data.playersInRoom.length < MIN_PLAYERS_TO_START && !isGameOver) { 
                 if(gameMessage) gameMessage.textContent += " Waiting for more players...";
                 if(rollDiceBtn) rollDiceBtn.disabled = true;
            }
        });
        
        socket.on('roomNotFound', (data) => {
            alert(`Error: ${data.message}`);
            resetRoomButtons();
        });
        socket.on('roomFull', (data) => {
            alert(`Error: ${data.message}`);
            resetRoomButtons();
        });
        socket.on('gameAlreadyStarted', (data) => {
            alert(`Error: ${data.message}`);
            resetRoomButtons(); 
        });

        socket.on('gameStart', (data) => {
            console.log('Game starting!', data);
            gameMessage.textContent = `Game Start! Room: ${data.roomId}. Starting: ${data.startingPlayerColor}`;
            activePlayers = data.players.map(p => p.color); 
            currentPlayerId = data.startingPlayerColor;
            currentPlayerIndex = activePlayers.indexOf(currentPlayerId);
            isGameOver = false; 
            updatePlayerTurnIndicator(); 
            if(rollDiceBtn) rollDiceBtn.disabled = (socket.id !== data.startingPlayerId); 
            initializeTokenPositions(); 
            
            // Update player list in the room management panel
            if(playerListDisplay) playerListDisplay.innerHTML = ''; // Clear old list
            data.players.forEach(p => { 
                const pDiv = document.createElement('div');
                const playerColor = p.color ? p.color.toLowerCase() : 'black';
                pDiv.innerHTML = `${p.name} <span style="color:${playerColor}; font-weight:bold;">(${p.color || 'N/A'})</span> ${p.id === socket.id ? '(You)' : ''}`;
                if(playerListDisplay) playerListDisplay.appendChild(pDiv);
            });
            
            const localPlayer = data.players.find(p=>p.id === socket.id);
            if (localPlayer && localPlayer.color && data.startingPlayerColor) {
                 alert(`Game is starting! You are ${localPlayer.color}. Starting player: ${data.startingPlayerColor}`);
            } else {
                 alert(`Game is starting! Starting player: ${data.startingPlayerColor}`); 
            }
        });

        socket.on('diceBroadcast', (data) => {
            console.log('Dice roll broadcast received:', data);
            
            currentDiceRoll = data.diceValue;
            rolledSix = (currentDiceRoll === 6);

            if (diceDisplay) { // Ensure diceDisplay is available
                diceDisplay.textContent = currentDiceRoll;
                diceDisplay.style.transform = 'rotate(360deg)';
                setTimeout(() => { diceDisplay.style.transform = 'none'; }, 200);
            } else {
                console.error("diceDisplay element not found for diceBroadcast.");
            }

            const rollerName = data.rollerName || (data.rollerId ? data.rollerId.substring(0,3) : 'Unknown Player');
            const playerDisplayName = (socket && data.rollerId === socket.id) ? "You" : rollerName;

            if (gameMessage) { // Ensure gameMessage is available
                if (rolledSix) {
                    gameMessage.textContent = `${playerDisplayName} rolled a 6! Select a token to move or activate.`;
                     // Server will handle if another roll is granted post-move. Client just enables UI for this move.
                } else {
                    gameMessage.textContent = `${playerDisplayName} rolled a ${currentDiceRoll}. Select a token to move.`;
                }
            } else {
                console.error("gameMessage element not found for diceBroadcast.");
            }

            // If this client is the one who rolled, their rollDiceBtn is already disabled.
            // Token clickability is primarily handled by `handleTokenClick` checking `currentPlayerId`.
            // `currentPlayerId` (color) should align with `data.rollerColor` if the game logic is correct.
            // The server's broadcast implies it's this player's (rollerColor's) turn to act on the roll.
            // No specific client-side change to `rollDiceBtn.disabled` here, as it's managed by turn flow.
        });

        socket.on('playerMoveBroadcasted', (data) => {
            console.log('Player move broadcast received:', data);

            const { movedTokenId, newCellId, isActivationMove, captureData, rollerId, wasSixRoll } = data;
            
            const tokenToMove = document.getElementById(movedTokenId);
            const targetCell = document.getElementById(newCellId);
            if (tokenToMove && targetCell) {
                targetCell.appendChild(tokenToMove);
                tokenPositions[movedTokenId] = newCellId;
            } else {
                console.error("Moved token or target cell not found on client board:", movedTokenId, newCellId);
            }

            if (captureData) {
                const capturedToken = document.getElementById(captureData.id);
                const homeCellForCaptured = document.getElementById(captureData.homeCellId);
                if (capturedToken && homeCellForCaptured) {
                    homeCellForCaptured.appendChild(capturedToken);
                    tokenPositions[captureData.id] = captureData.homeCellId;
                    gameMessage.textContent = `Player ${getTokenColor(movedTokenId)} captured ${getTokenColor(captureData.id)}'s token!`;
                } else {
                    console.error("Captured token or its home cell not found:", captureData);
                }
            } else {
                 if(gameMessage) gameMessage.textContent = `Player ${getTokenColor(movedTokenId)} moved token ${movedTokenId.split('-')[1]}.`;
            }

            if (socket.id === rollerId) { 
                if (wasSixRoll || isActivationMove) { 
                    if(gameMessage) gameMessage.textContent += " You get another roll!";
                    if(rollDiceBtn) rollDiceBtn.disabled = false; 
                }
            } else { 
                if (wasSixRoll || isActivationMove) {
                     if(gameMessage) gameMessage.textContent += ` ${getTokenColor(rollerId)} gets another roll.`;
                }
            }
            currentDiceRoll = 0; 
        });

    } catch (e) {
        console.error("Socket.IO client not loaded or error initializing:", e);
        if(gameMessage) gameMessage.textContent = 'Error setting up server connection.';
    }
});

// Helper function to update player list UI
function updatePlayerListUI(players) {
    if (!playerListDisplay) return; // Guard against playerListDisplay not being initialized
    playerListDisplay.innerHTML = ''; // Clear existing list
    if (!players) return;
    players.forEach(p => {
        const pDiv = document.createElement('div');
        const playerColor = p.color ? p.color.toLowerCase() : 'black';
        pDiv.innerHTML = `${p.name} <span style="color:${playerColor}; font-weight:bold;">(${p.color || 'N/A'})</span> ${p.id === socket.id ? '(You)' : ''}`;
        playerListDisplay.appendChild(pDiv);
    });
}

function resetRoomButtons() {
    if(createRoomBtn) createRoomBtn.disabled = false;
    if(joinRoomBtn) joinRoomBtn.disabled = false;
    if(roomIdInput) roomIdInput.disabled = false;
}

function initializeTokenPositions() {
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(token => {
        // Assuming token IDs like "red-1", "green-1" exist
        tokenPositions[token.id] = tokenInitialHomeCells[token.id]; 
    });
    console.log("Initial token positions:", tokenPositions);
}

function setupTokenClickListeners() {
    const tokens = document.querySelectorAll('.token');
    tokens.forEach(tokenElement => {
        tokenElement.addEventListener('click', () => {
            handleTokenClick(tokenElement);
        });
    });
}

function getTokenColor(tokenId) {
    if (tokenId.startsWith('red')) return 'RED';
    if (tokenId.startsWith('green')) return 'GREEN';
    if (tokenId.startsWith('yellow')) return 'YELLOW';
    if (tokenId.startsWith('blue')) return 'BLUE';
    return null;
}

function handleTokenClick(tokenElement) {
    if (isGameOver) return; // Prevent action if game is over

    const tokenId = tokenElement.id;
    const tokenColor = getTokenColor(tokenId);

    if (tokenColor !== currentPlayerId) {
        gameMessage.textContent = "Not your token!";
        return;
    }

    if (rollDiceBtn.disabled === false || currentDiceRoll === 0) {
        gameMessage.textContent = "Roll the dice first!";
        return;
    }

    // Check if the token is at home by comparing its current cell with its initial home cell
    const isAtHome = tokenPositions[tokenId] === tokenInitialHomeCells[tokenId];

    if (isAtHome) {
        activateTokenFromHome(tokenElement);
    } else {
        // Token is active on the board
        handleActiveTokenMove(tokenElement);
    }
}

function handleActiveTokenMove(tokenElement) {
    const tokenId = tokenElement.id;
    const tokenColor = getTokenColor(tokenId); // Should be currentPlayerId

    if (currentDiceRoll === 0) {
        gameMessage.textContent = "Roll the dice before moving a token.";
        return;
    }

    const playerPathData = LUDO_PATHS[tokenColor].completePath; // Array of cell IDs
    const currentCellId = tokenPositions[tokenId];
    
    let currentIndexInPath = playerPathData.indexOf(currentCellId);
    if (currentIndexInPath === -1) {
        console.error(`Token ${tokenId} current cell ${currentCellId} not found in its path!`);
        gameMessage.textContent = "Error: Token's path is corrupted.";
        // This might happen if LUDO_PATHS is not yet fully defined or tokenPositions is out of sync
        return;
    }

    // Ensure token cannot move if it has reached the final (victory) cell
    if (currentIndexInPath === playerPathData.length - 1) {
        gameMessage.textContent = `Token ${tokenId} is already home! Select another token.`;
        // If all tokens of a player are home, that player has won. Game end logic needed.
        // If this specific token is home, but others can move, player must choose another.
        // If no other token can move with current roll:
        //  - if rolledSix was false, then switchToNextPlayer().
        //  - if rolledSix was true, then re-enable dice for current player.
        // This "no valid moves" check is complex and will be handled more broadly later.
        // For now, just prevent further movement of this token. User must click another or game state handles it.
        return; 
    }

    let newIndexInPath = currentIndexInPath + currentDiceRoll;

    // Handle Overshooting: Token cannot move if it would overshoot the end of its path.
    if (newIndexInPath >= playerPathData.length) {
        gameMessage.textContent = `Move for ${tokenId} overshoots. Choose another token or pass.`;
        // Similar to the "already home" case, a broader "no valid moves" check is needed.
        // If this is the only token, or all other tokens also overshoot:
        //  - if rolledSix was false, then switchToNextPlayer().
        //  - if rolledSix was true, then re-enable dice for current player.
        // For now, the player must select another token if this one overshoots.
        return;
    }

    const newCellId = playerPathData[newIndexInPath];
    const newCellElement = document.getElementById(newCellId);

    if (!newCellElement) {
        console.error(`New cell ${newCellId} not found on board!`);
        return;
    }
    
    // --- Basic Stacking & Capture Placeholder ---
    // Logic for capture and safe cells will be added in later steps.
    // For now, just move the token. If other tokens are on newCellElement, they'll stack visually.

    // --- Capture Logic ---
    // Check if newCellId is a safe cell
    const isSafeCell = FINAL_SAFE_CELLS.includes(newCellId);
    let captureOccurred = false;

    if (!isSafeCell) {
        // Cell is not safe, check for opponent tokens on newCellElement
        const tokensOnNewCell = Array.from(newCellElement.children).filter(child => child.classList.contains('token'));
        
        tokensOnNewCell.forEach(tokenOnCell => {
            const existingTokenId = tokenOnCell.id;
            const existingTokenColor = getTokenColor(existingTokenId);

            if (existingTokenColor !== currentPlayerId) { // It's an opponent's token
                // Capture the opponent's token
                const opponentHomeCellId = tokenInitialHomeCells[existingTokenId];
                const opponentHomeCellElement = document.getElementById(opponentHomeCellId);

                if (opponentHomeCellElement) {
                    opponentHomeCellElement.appendChild(tokenOnCell); // Move to home
                    tokenPositions[existingTokenId] = opponentHomeCellId; // Update position
                    captureOccurred = true;
                    console.log(`Token ${existingTokenId} captured by ${tokenId} and sent to ${opponentHomeCellId}`);
                    // Play capture sound here conceptually
                    // e.g., playSound('capture'); 
                } else {
                    console.error(`Opponent's home cell ${opponentHomeCellId} not found for token ${existingTokenId}`);
                }
            }
        });
    }
    // --- End of Capture Logic ---

    // Move the current player's token (tokenElement)
    newCellElement.appendChild(tokenElement);
    tokenPositions[tokenId] = newCellId; // Update position for the moved token

    // Check for win condition - This should ideally be checked *after* server confirms the move
    // For now, we'll leave it here, but it's better on server or after 'playerMoveBroadcasted'
    if (checkWinCondition(currentPlayerId)) {
        isGameOver = true;
        gameMessage.textContent = `GAME OVER! Player ${currentPlayerId} WINS!`;
        rollDiceBtn.disabled = true; 
        console.log(`Game Over. Player ${currentPlayerId} has won!`);
        return; // Stop further processing, even emitting if game is won locally.
    }

    // Client-side checks passed. Now prepare to emit.
    const roomId = document.getElementById('game-container').dataset.roomId;
    if (roomId && socket) { // Ensure socket is defined
        let capturedTokenInfo = null;
        // const potentialNewCellElement = document.getElementById(newCellId); // Not needed here as we don't modify DOM
        const isSafe = FINAL_SAFE_CELLS.includes(newCellId);

        if (!isSafe) { // Client-side check for potential capture to send to server
            const newCellElement = document.getElementById(newCellId); // Need to check children of newCellElement
            if (newCellElement) { // Ensure the new cell element exists
                const tokensOnNewCell = Array.from(newCellElement.children).filter(child => child.classList.contains('token'));
                for (const tokenOnCell of tokensOnNewCell) {
                    if (getTokenColor(tokenOnCell.id) !== currentPlayerId) { 
                        capturedTokenInfo = { id: tokenOnCell.id, homeCellId: tokenInitialHomeCells[tokenOnCell.id] };
                        break; 
                    }
                }
            }
        }

        socket.emit('tokenMoved', {
            roomId: roomId,
            playerId: socket.id,
            tokenId: tokenId,
            currentCellId: currentCellId, // For server validation/logging
            targetCellId: newCellId,
            isActivation: false,
            diceValueUsed: currentDiceRoll,
            capturedTokenInfo: capturedTokenInfo
        });
        // UI update will happen upon server broadcast ('playerMoveBroadcasted').
        // rollDiceBtn is already disabled. It will be handled by broadcast.
    } else {
        console.error("No roomId or socket to emit tokenMoved for active move.");
    }
    // The local DOM manipulation, tokenPositions update, and post-move logic (switchToNextPlayer, etc.)
    // are removed from here. They will be handled by the 'playerMoveBroadcasted' listener.
}

function activateTokenFromHome(tokenElement) {
    const tokenId = tokenElement.id;

    if (currentDiceRoll !== 6) {
        gameMessage.textContent = "You need a 6 to bring a token out!";
        return;
    }

    const playerPathData = LUDO_PATHS[currentPlayerId];
    const entryCellId = playerPathData.entryCell; 

    // Check if entry cell is occupied by OWN token(s)
    for (const tId in tokenPositions) {
        if (getTokenColor(tId) === currentPlayerId && tokenPositions[tId] === entryCellId) {
            gameMessage.textContent = `Your entry cell (${entryCellId}) is blocked by your own token. Move that token first.`;
            return; 
        }
    }
    
    let entryCellOccupiedByOpponent = false;
    for (const tId in tokenPositions) {
        if (getTokenColor(tId) !== currentPlayerId && tokenPositions[tId] === entryCellId) {
            entryCellOccupiedByOpponent = true;
            break;
        }
    }

    if (entryCellOccupiedByOpponent && FINAL_SAFE_CELLS.includes(entryCellId)) {
         gameMessage.textContent = `Entry cell (${entryCellId}) is a safe cell occupied by an opponent. Cannot move there now.`;
         return;
    }

    // If those checks pass:
    
    const roomId = document.getElementById('game-container').dataset.roomId;
    if (roomId && socket) { // Ensure socket is defined
        // Send move to server for validation and broadcast
        socket.emit('tokenMoved', {
            roomId: roomId,
            playerId: socket.id, // Identifies who made the move
            tokenId: tokenId,
            targetCellId: entryCellId,
            isActivation: true,
            diceValueUsed: 6, // The 6 that was rolled
            // No capture on activation from home as entry cells are safe
        });
        // UI update will happen upon server broadcast ('playerMoveBroadcasted')
        // rollDiceBtn is already disabled. It will be re-enabled for this player by the broadcast handler.
    } else {
        console.error("No roomId or socket to emit tokenMoved for activation.");
    }
}
