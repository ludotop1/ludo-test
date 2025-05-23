// Add to the top of script.js or within an init function
const diceDisplay = document.getElementById('dice-display');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const gameMessage = document.getElementById('game-message');
const playerTurnIndicator = document.getElementById('player-turn-indicator'); // Added for completeness

let currentDiceRoll = 0;
let rolledSix = false;

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
    // After rolling, the game should typically disable the roll button until the turn is fully processed.
    rollDiceBtn.disabled = true; 

    if (rolledSix) {
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

});

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

    // Post-move actions
    if (captureOccurred) {
        gameMessage.textContent = `Token ${tokenId} captured opponent at ${newCellId}!`;
    } else {
        gameMessage.textContent = `Token ${tokenId} moved to ${newCellId}.`;
    }
    
    const diceRolledWasSix = rolledSix; // Store before resetting currentDiceRoll
    
    currentDiceRoll = 0; // Dice roll has been used

    if (diceRolledWasSix) {
        // If a capture occurred on a 6-roll, the player still gets to roll again.
        gameMessage.textContent += (captureOccurred ? " " : "") + "You rolled a 6, roll again!";
        rolledSix = false; 
        rollDiceBtn.disabled = false; 
    } else {
        // Standard move, switch to next player
        // If a capture occurred on a non-6-roll, the turn still switches.
        switchToNextPlayer();
    }
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

    // Move token
    const entryCellElement = document.getElementById(entryCellId);
    if (entryCellElement) {
        // Append token to the new cell
        entryCellElement.appendChild(tokenElement);
        tokenPositions[tokenId] = entryCellId; // Update token's current position

        gameMessage.textContent = `Token ${tokenId} moved to start! Roll again.`;
        currentDiceRoll = 0; // Mark 6 as used for activation
        // rolledSix flag is true (because currentDiceRoll was 6), so turn doesn't switch yet.
        rollDiceBtn.disabled = false; // Allow current player to roll again.
        
    } else {
        console.error(`Entry cell ${entryCellId} not found!`);
    }
}
