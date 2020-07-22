var gBoard = null
var gLevel = {
  SIZE: 4,
  MINES: 2,
}
var gGame = {
  isOn: false,
  showCount: 0,
  markedCount: 0,
  secsPassed: 0,
}

function initGame() {
  gBoard = buildBoard()
  renderBoard()
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: true,
        isMine: false,
        isMarked: false,
        isClicked: false,
      }
      board[i][j] = cell
    }
  }
  return setRandomMines(board)
}

function setMinesNegsCount(board, currRow, currCol) {
  for (var i = currRow - 1; i <= currRow + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = currCol - 1; j <= currCol + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue
      board[i][j].minesAroundCount++
    }
  }
}

function setRandomMines(board) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var row = getRandomInt(0, gLevel.SIZE)
    var col = getRandomInt(0, gLevel.SIZE)
    if (!board[row][col].isMine) {
      board[row][col].isMine = true
      setMinesNegsCount(board, row, col)
    }
  }
  return board
}

function renderBoard() {
  var strHtml = ''
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHtml += '<tr>'
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = gBoard[i][j]
      strHtml += `<td data-id=${i}-${j} class="cell cell-unclicked" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})">${
        cell.isMine
          ? 'mine'
          : cell.minesAroundCount > 0
          ? cell.minesAroundCount
          : cell.isMarked
          ? 'flag'
          : ''
      }`
      strHtml += '</td>'
    }
    strHtml += '</tr>'
  }
  var elTable = document.querySelector('.board')
  elTable.innerHTML = strHtml
}

function cellClicked(elCell, i, j) {
  gGame.isOn = true
  if (elCell.classList.contains('cell-clicked') || gBoard[i][j].isMarked) return
  if (gBoard[i][j].isMine || gBoard[i][j].isMarked) return
  if (gBoard[i][j].minesAroundCount === 0) {
    expandShown(i, j)
  } else {
    elCell.classList.add('cell-clicked')
    elCell.classList.remove('cell-unclicked')
  }
}

function cellMarked(elCell, i, j) {
  if (gBoard[i][j].isMine || elCell.classList.contains('cell-clicked')) return
  if (!elCell.innerText) elCell.innerText = 'flag'
  else elCell.innerText = ''
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked
}

function expandShown(currRow, currCol) {
  // // var currElCell = document.querySelector(`td[data-id="${currRow}-${currCol}"]`)

  // if (gBoard[currRow][currCol].minesAroundCount > 0) return

  // console.log('In cell: ' + currRow + ' - ' + currCol)
  for (var i = currRow - 1; i <= currRow + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = currCol - 1; j <= currCol + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue
      var newElCell = document.querySelector(`td[data-id="${i}-${j}"]`)
      if (
        !newElCell.classList.contains('cell-clicked') &&
        !gBoard[i][j].isMarked
      ) {
        newElCell.classList.remove('cell-unclicked')
        newElCell.classList.add('cell-clicked')
      }
    }
  }
}

function onButtonClick(elBtn) {
  switch (elBtn.innerText) {
    case 'Easy':
      gLevel.SIZE = 4
      gLevel.MINES = 2
      initGame()
      break
    case 'Medium':
      gLevel.SIZE = 8
      gLevel.MINES = 12
      initGame()
      break
    case 'Hard':
      gLevel.SIZE = 12
      gLevel.MINES = 30
      initGame()
      break
    default:
      return
  }
}
