'use strict'

var MINE = '<img src="img/mine.png" style="width:60%; height: 60%;">'
var FLAG = `<i class="fas fa-flag cell-color-orange-red"></i>`
var SMILE = '&#128578;'
var SAD_SMILE = '&#128557'
var HAPPY_SMILE = '&#128515;'
var LIFE = `<i class="fas fa-heart fa-2x" style="color: gray;"></i>`
var HINT = `<i class="far fa-lightbulb fa-2x" style="color: gray;"></i>`

var gTimer = null
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
  lifes: 3,
  hints: 3,
  isHint: false,
}

var numColors = ['transparent', 'green', 'blue', 'orange', 'purple', 'red']

function initGame() {
  gBoard = buildBoard()
  clearInterval(gTimer)
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.showCount = 0
  gGame.isOn = false
  gGame.lifes = 3
  gGame.hints = 3
  gGame.isHint = false

  renderBoard()
  renderPanel()
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  return board
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

function setRandomMines(board, i, j) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var isMinePlaced = false
    while (!isMinePlaced) {
      var row = getRandomInt(0, gLevel.SIZE)
      var col = getRandomInt(0, gLevel.SIZE)
      if (!board[row][col].isMine && row !== i && col !== j) {
        board[row][col].isMine = true
        setMinesNegsCount(board, row, col)
        isMinePlaced = true
      }
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
      strHtml += `<td data-id=${i}-${j} class="cell cell-unclicked cell-color-${
        numColors[cell.minesAroundCount]
      }" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})">
      ${cell.isShown ? cell.minesAroundCount : ''}`
      strHtml += '</span> </td>'
    }
    strHtml += '</tr>'
  }
  var elTable = document.querySelector('.board')
  elTable.innerHTML = strHtml
}

function renderPanel() {
  var strHints = ''
  var strLifes = ''
  for (var i = 0; i < 3; i++) {
    strLifes += `<span class="life"
              ><i
                class="fas fa-heart fa-2x"
                style="color: red; padding-top: 4px;"
              ></i
            ></span>`
    strHints += `<span class="hint"
              ><i
                class="far fa-lightbulb fa-2x"
                style="color: orange; padding-top: 3px;"
              ></i
            ></span>`
  }

  strHints += `<button onclick="useHint()" class="btn btn-hint">
            Use Hint
          </button>`
  var elDisplay = document.querySelector('.display-text')
  elDisplay.innerText = '0 : 00'
  var elHints = document.querySelector('.hints')
  elHints.innerHTML = strHints
  var elHints = document.querySelector('.lifes')
  elHints.innerHTML = strLifes
  var elSmile = document.querySelector('.smiley')
  elSmile.innerHTML = SMILE
}

function cellClicked(elCell, i, j) {
  if (!gGame.isOn) {
    firstClick('left-click', i, j)
    return
  }
  if (elCell.classList.contains('cell-clicked') || gBoard[i][j].isMarked) return
  if (gBoard[i][j].isMine) {
    var elLifes = document.querySelectorAll('.life')
    elCell.classList.add('mark-red')
    elCell.classList.add('cell-clicked')
    elCell.classList.remove('cell-unclicked')
    elCell.innerHTML = MINE
    gGame.lifes--
    gGame.showCount++
    gBoard.isShown = true
    for (var i = elLifes.length - 1; i >= 0; i--) {
      if (!elLifes[i].classList.contains('used')) {
        elLifes[i].classList.add('used')
        elLifes[i].innerHTML = LIFE
        break
      }
    }

    if (!gGame.lifes) stopGame(false)
    checkGameOver()
    return
  }
  if (gBoard[i][j].isMarked) return
  if (!gBoard[i][j].minesAroundCount) {
    expandShown(i, j)
  } else {
    updateCell(elCell, i, j)
    gGame.showCount++
  }
  if (gGame.isHint) gGame.isHint = false
  checkGameOver()
}

function cellMarked(elCell, i, j) {
  if (elCell.classList.contains('cell-clicked')) return
  if (!gGame.isOn) {
    firstClick('right-click', i, j)
    return
  }
  if (!gBoard[i][j].isMarked) {
    elCell.innerHTML = FLAG
    gGame.markedCount++
  } else {
    elCell.innerHTML = ''
    gGame.markedCount--
  }
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked
  checkGameOver()
}

function expandShown(currRow, currCol) {
  for (var i = currRow - 1; i <= currRow + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue
    for (var j = currCol - 1; j <= currCol + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue
      var newElCell = document.querySelector(`td[data-id="${i}-${j}"]`)
      if (
        !newElCell.classList.contains('cell-clicked') &&
        !gBoard[i][j].isMarked
      ) {
        updateCell(newElCell, i, j)
        gGame.showCount++
        if (!gBoard[i][j].minesAroundCount) expandShown(i, j) // recursive expansion
      }
    }
  }
}

function firstClick(mouseClick, i, j) {
  gGame.isOn = true
  gBoard = setRandomMines(gBoard, i, j)
  renderBoard()
  gTimer = setInterval(startTimer, 1000)
  var elCell = document.querySelector(`td[data-id="${i}-${j}"]`)
  if (mouseClick === 'left-click') cellClicked(elCell, i, j)
  else cellMarked(elCell, i, j)
}

function startTimer() {
  var elDisplay = document.querySelector('.display-text')
  gGame.secsPassed++
  elDisplay.innerText = getFormattedTime(gGame.secsPassed)
}

function checkGameOver() {
  var numOfMines = gLevel.MINES - (3 - gGame.lifes)
  var cellsToUncover = Math.pow(gLevel.SIZE, 2) - numOfMines
  if (gGame.markedCount === numOfMines && gGame.showCount === cellsToUncover) {
    stopGame(true)
  }
}

function stopGame(isSuccess) {
  gGame.isOn = false
  var elSmile = document.querySelector('.smiley')
  var elDisplay = document.querySelector('.display-text')
  if (isSuccess) {
    elDisplay.innerText =
      'Congratulations!\nYour time: ' + getFormattedTime(gGame.secsPassed)
    elSmile.innerHTML = HAPPY_SMILE
  } else {
    for (var i = 0; i < gLevel.SIZE; i++) {
      for (var j = 0; j < gLevel.SIZE; j++) {
        var elCell = document.querySelector(`td[data-id="${i}-${j}"]`)
        if (!gBoard[i][j].isShown) {
          elCell.classList.add('cell-clicked')
          elCell.classList.remove('cell-unclicked')
          if (gBoard[i][j].isMine) elCell.innerHTML = MINE
        }
      }
    }
    elSmile.innerHTML = SAD_SMILE
    elDisplay.innerText = 'GAME OVER'
  }
  clearInterval(gTimer)
}

function updateCell(elCell, i, j) {
  elCell.classList.add('cell-clicked')
  elCell.classList.remove('cell-unclicked')
  gBoard[i][j].isShown = true
  elCell.innerText = !gBoard[i][j].minesAroundCount
    ? ''
    : gBoard[i][j].minesAroundCount
}

function useHint() {
  if (!gGame.isOn || !gGame.hints) return
  gGame.isHint = true
  var elHints = document.querySelectorAll('.hint')
  for (var i = elHints.length - 1; i >= 0; i--) {
    if (!elHints[i].classList.contains('used')) {
      elHints[i].classList.add('used')
      elHints[i].innerHTML = HINT
      gGame.hints--
      break
    }
  }
  while (gGame.isHint) {
    var randRow = getRandomInt(0, gLevel.SIZE)
    var randCol = getRandomInt(0, gLevel.SIZE)
    var cell = gBoard[randRow][randCol]
    if (!cell.isShown && !cell.isMarked && !cell.isMine) {
      var elCell = document.querySelector(`td[data-id="${randRow}-${randCol}"]`)
      elCell.classList.add('hint-cell')
      setTimeout(function () {
        elCell.classList.remove('hint-cell')
      }, 1000)
      gGame.isHint = false
    }
  }
}

function onButtonClick(elBtn) {
  var elButtons = document.querySelectorAll('.btn')
  for (var i = 0; i < elButtons.length; i++) {
    if (elButtons[i].classList.contains('btn-clicked'))
      elButtons[i].classList.toggle('btn-clicked')
  }
  elBtn.classList.toggle('btn-clicked')
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
