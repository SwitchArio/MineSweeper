getNewEmptyBoard = () => new Array(INDEX).fill(-2).map(() => new Array(INDEX).fill(-2))

let INDEX = 9 // 10 mines
let BOARD = getNewEmptyBoard()
let alreadyCreated = false

const boardElement = document.getElementById("board")


// setGrid(9, 9)

function printMap(BOARD) {
    let stringMap = "";
    for (let i = 0; i < INDEX; i++) {
        for (let j = 0; j < INDEX; j++) {
            if(BOARD[i][j] == -1) stringMap += "X"
            else if(neighboursCounter(BOARD, INDEX-1, i, j) > 0) stringMap += "#"
            else stringMap += "O"
        }
        stringMap += "\n"
    }
    return stringMap
}

// Logic

function updateCells(row, column) {
    if(BOARD[row][column] == -1) {
        setCellsState(row, column, false)
        return alert("fai schifo")
    }
    else if (BOARD[row][column] > 0) setCellsState(row, column, false)
    else unlockSafeCells(row, column)
    console.log(BOARD)
}

function unlockSafeCells(row, column) {

    if(row < 0 || column < 0 || row >= INDEX || column >= INDEX) return
    setCellsState(row, column, false)
    if (BOARD[row][column] >= -1) return



    let neighbours = getNeighbours(row, column)
    for (const neighbour of neighbours) {
        // alert(neighbour[0] + " " + neighbour[1])
        if(row == neighbour[0] && column == neighbour[1]) continue
        if(isVisible(neighbour[0], neighbour[1])) continue
        // alert("arrivato")
        setCellsState(neighbour[0], neighbour[1], false)

        if(BOARD[row][column] >= -1) continue
        unlockSafeCells(neighbour[0], neighbour[1])
    }
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
    let mineRow, mineColumn, minesPlaced = 1, minesPosition = []

    while (minesPlaced < numberOfMines){
        mineRow = Math.floor(Math.random() * index);
        mineColumn = Math.floor(Math.random() * index);
        if (safeCells.some(item => JSON.stringify(item) == JSON.stringify([mineRow, mineColumn]))) continue
        minesPlaced++
        minesPosition.push([mineRow, mineColumn])
    }
    return minesPosition
}

function getNeighbours(r, c) {
    return [
        [r-1, c-1], [r-1, c], [r-1, c+1],
        [r, c-1], [r, c], [r, c+1],
        [r+1, c-1], [r+1, c], [r+1, c+1]
    ]
}

function setCellsState(r, c, hidden = true) {
    if(r < 0 || c < 0 || r >= INDEX || c >= INDEX) return
    let cell = document.getElementById(`${r}:${c}`)
    if(BOARD[r][c] == -2) cell.className = "safe"
    if(BOARD[r][c] == -1) cell.className = "mine"
    if(BOARD[r][c] > 0) {
        cell.className = "near"
        cell.innerText = neighboursCounter(BOARD,INDEX - 1, r, c).toString()
    }

    cell.className = (hidden) ? cell.className + " hidden" : cell.className + " visible"
}

function isVisible(r, c) {
    if(r < 0 || c < 0 || r >= INDEX || c >= INDEX) return true
    let cell = document.getElementById(`${r}:${c}`)
    return cell.className.indexOf("hidden") == -1;
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

// Graphic

function setGrid(row, columns) {
    INDEX = row
    INDEX = columns
    boardElement.style.gridTemplateRows = `repeat(${INDEX}, 40px)`
    boardElement.style.gridTemplateColumns = `repeat(${INDEX}, 40px)`
    console.log(`impostato su ${INDEX}x${INDEX} (RIGHExCOLONNE)`)

    setUpGraphic(BOARD, INDEX)
}

function setUpGraphic(board, index) {
    deleteChildren()
    for (let r = 0; r < index; r++)
        for (let c = 0; c < index; c++){
            let cell = document.createElement("div")
            cell.onclick = () => {
                if (!alreadyCreated) {
                    BOARD = createMap(r, c, INDEX, 10)
                    console.log( printMap(BOARD))
                    alreadyCreated = true
                }
                updateCells(r, c)
            }
            cell.id = `${r}:${c}`
            if (board[r][c] == -2) cell.className = "safe hidden"
            else if(board[r][c] == -1) cell.className = "mine hidden"
            else if(board[r][c] >= 0) cell.className = "near hidden"
            boardElement.appendChild(cell)
        }
}

function deleteChildren() {
    let first = boardElement.firstElementChild;
    while (first) {
        first.remove();
        first = boardElement.firstElementChild;
    }
}


