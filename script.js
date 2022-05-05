getNewEmptyBoard = () => new Array(INDEX).fill(-2).map(() => new Array(INDEX).fill(-2))

let INDEX, BOARD, MINES, HIDDEN_MINES, HIDDENS_CELL, minesPosition = [], alreadyCreated = false

const boardElement = document.getElementById("board")
boardElement.oncontextmenu = () => false

const playButton = document.getElementById("btn")
playButton.onclick  = () => {
    playButton.innerText = "Gioca"
    document.getElementById('overlay').style.display = 'none';
    alreadyCreated = false;

    let value, labels = document.getElementById("level").children
    for (let label of labels)
        if (label.firstElementChild.checked)
            value = label.firstElementChild.value.split("-")

    setGrid(eval(value[0]), eval(value[0]), eval(value[1]));
}

// Logic

function updateCells(row, column) {
    if(BOARD[row][column] != -1) {
        unlockSafeCells(row, column)
        return
    }

    for (const mine of minesPosition)
        setCellsState(mine[0], mine[1], false)

    gameOver(false)

    playButton.innerText = "Gioca ancora"
}

function unlockSafeCells(row, column) {
    if(row < 0 || column < 0 || row >= INDEX || column >= INDEX) return

    setCellsState(row, column, false)
    HIDDENS_CELL--
    updateStats()
    if (HIDDENS_CELL-MINES == 0) gameOver(true)

    if (BOARD[row][column] >= -1) return

    let neighbours = getNeighbours(row, column)
    for (const neighbour of neighbours) {
        if(row == neighbour[0] && column == neighbour[1]) continue
        if(isVisible(neighbour[0], neighbour[1])) continue
        setCellsState(neighbour[0], neighbour[1], false)

        if(BOARD[row][column] >= -1) continue
        unlockSafeCells(neighbour[0], neighbour[1])
    }
}

function setCellsState(r, c, hidden = true) {
    if(r < 0 || c < 0 || r >= INDEX || c >= INDEX) return
    let cell = document.getElementById(`${r}:${c}`)
    if(BOARD[r][c] == -2) cell.className = "safe "
    if(BOARD[r][c] == -1) cell.className = "mine "
    if(BOARD[r][c] > 0) {
        cell.className = "near "
        switch (BOARD[r][c]) {
            case 1: cell.className += "n1 "; break
            case 2: cell.className += "n2 "; break
            case 3: cell.className += "n3 "; break
            case 4: cell.className += "n4 "; break
            case 5: cell.className += "n5 "; break
        }
        cell.innerText = neighboursCounter(BOARD,INDEX - 1, r, c).toString()
    }

    HIDDEN_MINES += (cell.style.backgroundImage.indexOf("rickroll-face") != -1) ? 1 : 0
    updateStats()

    cell.style.opacity = "1"
    cell.style.backgroundImage = "none"
    cell.oncontextmenu = () => false
    cell.className += hidden ? "hidden" : "visible"
}

function createMap(r, c, index, numberOfMines) {
    let map = getNewEmptyBoard()
    let minesPosition = getMinesPosition(r, c, index, numberOfMines)

    for (let i = 0; i < index; i++)
        for (let j = 0; j < index; j++)
            if (minesPosition.some(item => JSON.stringify(item) == JSON.stringify([i, j])))
                map[i][j] = -1

    for (let i = 0; i < index; i++)
        for (let j = 0; j < index; j++)
            if (map[i][j] != -1 && neighboursCounter(map, index-1, i, j) > 0)
                map[i][j] = neighboursCounter(map,index - 1, i, j)

    return map
}

function getMinesPosition(r, c, index, numberOfMines) {
    let safeCells = getNeighbours(r, c)
    let mineRow, mineColumn, minesPlaced = 0, mPosition = []

    while (minesPlaced < numberOfMines){
        mineRow = Math.floor(Math.random() * index);
        mineColumn = Math.floor(Math.random() * index);
        if (safeCells.some(item => JSON.stringify(item) == JSON.stringify([mineRow, mineColumn]))) continue
        if (mPosition.some(item => JSON.stringify(item) == JSON.stringify([mineRow, mineColumn]))) continue
        minesPlaced++
        mPosition.push([mineRow, mineColumn])
    }
    minesPosition = Array.from(mPosition)
    return mPosition
}

function neighboursCounter(board, index, r, c) {
    let neighbours = 0
    if(r > 0){
        if(c > 0 && board[r-1][c-1] == -1)  neighbours += 1
        if(board[r-1][c] == -1)  neighbours += 1
        if(c < index && board[r-1][c+1] == -1) neighbours += 1
    }

    if(c > 0 && board[r][c-1] == -1) neighbours += 1
    if(c < index && board[r][c+1] == -1) neighbours += 1

    if(r < index) {
        if(c > 0 && board[r+1][c-1] == -1) neighbours += 1
        if(board[r+1][c] == -1) neighbours += 1
        if(c < index && board[r+1][c+1] == -1) neighbours += 1
    }
    return neighbours
}

function getNeighbours(r, c) {
    return [
        [r-1, c-1], [r-1, c], [r-1, c+1],
        [r, c-1], [r, c], [r, c+1],
        [r+1, c-1], [r+1, c], [r+1, c+1]
    ]
}

function isVisible(r, c) {
    if(r < 0 || c < 0 || r >= INDEX || c >= INDEX) return true
    let cell = document.getElementById(`${r}:${c}`)
    return cell.className.indexOf("hidden") == -1;
}

// Graphic

function setGrid(row, columns, mines) {
    INDEX = row
    INDEX = columns
    BOARD = getNewEmptyBoard()
    boardElement.style.gridTemplateRows = `repeat(${INDEX}, 5vh)`
    boardElement.style.gridTemplateColumns = `repeat(${INDEX}, 5vh)`
    console.log(`impostato su ${INDEX}x${INDEX} (RIGHExCOLONNE)`)

    HIDDEN_MINES = MINES = mines
    HIDDENS_CELL = INDEX*INDEX
    updateStats(true)
    setUpGraphic(BOARD, INDEX, mines)
}

function setUpGraphic(board, index, mines) {
    deleteChildren()
    for (let r = 0; r < index; r++)
        for (let c = 0; c < index; c++){
            let cell = document.createElement("div")
            cell.onclick = () => {
                if (!alreadyCreated) {
                    BOARD = createMap(r, c, INDEX, mines)
                    alreadyCreated = true
                }
                updateCells(r, c)
            }
            cell.oncontextmenu = () => {
                if (!alreadyCreated) return false

                let isThereBackGround = (cell.style.backgroundImage.indexOf("rickroll-face") != -1)
                cell.style.backgroundImage = isThereBackGround ? "none" : "url('data/other data/rickroll-face.jpg')"
                cell.style.opacity = isThereBackGround ? "0.4" : "1"
                HIDDEN_MINES += isThereBackGround ? 1 : -1
                updateStats()

                return false
            }
            cell.id = `${r}:${c}`
            cell.className = "safe hidden cell"
            boardElement.appendChild(cell)
        }
}

function updateStats(firstMove=false){
    let stats = document.getElementById("stats")
    if (firstMove)
        stats.innerText = `probabilità di trovare una mina: 0%\nnon puoi sbagliare ;)`
    else
        stats.innerText = `probabilità di trovare una mina: ${Math.round(HIDDEN_MINES/HIDDENS_CELL*1000)/10}% (${HIDDEN_MINES}/${HIDDENS_CELL})`
}

function gameOver(victory) {
    let nOfBackgrounds = 3;
    let ending = victory ? "win" : "lost"
    let chosenBackground = `data/${ending}-background/img${Math.floor(Math.random() * nOfBackgrounds)}.jpg`
    let overlayDiv = document.getElementById("overlay")
    overlayDiv.style.background = `url("${chosenBackground}") no-repeat center`;
    overlayDiv.style.backgroundSize = "cover";
    overlayDiv.style.opacity = "0.6";
    overlayDiv.style.display = "block"; // cover over
    overlayDiv.style.display = "block"; // cover over
    overlayDiv.innerText = victory ? "HAI VINTO" : "HAI PERSO"
}

function deleteChildren() {
    let first = boardElement.firstElementChild;
    while (first) {
        first.remove();
        first = boardElement.firstElementChild;
    }
}
