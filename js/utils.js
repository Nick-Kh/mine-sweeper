function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function getFormattedTime(seconds) {
  var strMins = ''
  var strSecs = ''
  if (seconds >= 60) {
    strMins = parseInt(seconds / 60)
    strSecs = seconds % 60
  } else {
    strMins = '0'
    strSecs = seconds >= 10 ? seconds : '0' + seconds
  }
  return strMins + ' : ' + strSecs
}
