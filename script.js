const game = new Chess();
const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');
let selected = null;
let highlights = [];
// 🔹 NEW: history stacks
let historyStack = [];
let redoStack = [];

const P = {
    w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

const file = i => 'abcdefgh'[i];
const squareOf = (row, col) => file(col) + (8 - row);




/* return algebraic square name, ex: 'e1' */
function sqName(row, col) {
    return 'abcdefgh'[col] + (8 - row);
}

/* find the king’s square for the given colour ('w' | 'b') */
function findKingSquare(color) {
    const b = game.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            if (p && p.type === 'k' && p.color === color) {
                return sqName(r, c);
            }
        }
    }
    return null;
}


function renderBoard() {

    boardEl.innerHTML = '';
    const board = game.board();
    const sideInCheck = (game.in_check() || game.in_checkmate()) ? game.turn() : null;
    const kingInCheckSq = sideInCheck ? findKingSquare(sideInCheck) : null;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq = squareOf(row, col);
            const div = document.createElement('div');
            div.className = ((row + col) % 2 === 0) ? 'white' : 'black';
            div.dataset.square = sq;

            if (sq === selected) div.classList.add('selected');
            if (highlights.includes(sq)) div.classList.add('highlight');
            if (sq === kingInCheckSq) div.classList.add('check');

            const piece = board[row][col];
            if (piece) div.textContent = P[piece.color][piece.type];
            boardEl.appendChild(div);
        }
    }
    updateStatus();
    updateMoveHistory(); // 🔹 NEW: update move history
}

function updateStatus() {
    if (game.in_checkmate()) {
        statusEl.textContent = `Checkmate – ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (game.in_draw()) {
        statusEl.textContent = 'Draw.';
    } else {
        statusEl.textContent = `${game.turn() === 'w' ? 'White' : 'Black'} to move${game.in_check() ? ' (check)' : ''}`;
    }
}
// 🔹 NEW: show move history
function updateMoveHistory() {
    const moveEl = document.getElementById('moveHistory');
    let out = '';
    historyStack.forEach((m, i) => {
        out += `${i + 1}. ${m.from} → ${m.to}\n`;
    });
    moveEl.textContent = out.trim();
}

function onSquareClick(e) {
    const sq = e.target.dataset.square;
    if (!sq) return;

    if (selected) {
        const move = game.move({ from: selected, to: sq, promotion: 'q' });
        if (move) {
            selected = null;
            highlights = [];
        } else if (game.get(sq) && game.get(sq).color === game.turn()) {
            selectSquare(sq);
        } else {
            return;
        }
        renderBoard();
        return;
    }

    selectSquare(sq);
}


function selectSquare(sq) {
    const piece = game.get(sq);
    if (!piece || piece.color !== game.turn()) return;

    selected = sq;
    highlights = game.moves({ square: sq, verbose: true }).map(m => m.to);
    renderBoard();
}

boardEl.addEventListener('click', onSquareClick);
// 🔹 NEW: Undo button behavior
document.getElementById('undoBtn').addEventListener('click', () => {
    const move = game.undo();
    if (move) {
        redoStack.push(move);
        historyStack.pop();
        selected = null;
        highlights = [];
        renderBoard();
    }
});
// 🔹 NEW: Redo button behavior
document.getElementById('redoBtn').addEventListener('click', () => {
    if (redoStack.length === 0) return;
    const move = redoStack.pop();
    game.move(move);
    historyStack.push(move);
    selected = null;
    highlights = [];
    renderBoard();
});
renderBoard();


