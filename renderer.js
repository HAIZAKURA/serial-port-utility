// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const { StringStream } = require("scramjet")
const $ = jQuery = layui.$

let port = null

serialport.list().then(ports => {
  // ports.forEach(port => {
  //   console.log(port.path, port.manufacturer, port.serialNumber, port.pnpId, port.locationId, port.productId, port.vendorId)
  // })
  ports.forEach(port => {
    $("select[name='port']").append("<option value='" + port.path + "'>" + port.path + "</option>")
  })
})

// for (let i = 1; i <= 100; i++) {
//   $("#log").append(i.toString() + "\n")
//   $("#log").scrollTop($("#log")[0].scrollHeight)
// }

function refreshPorts() {
  $("select[name='port']").empty()
  serialport.list().then(ports => {
    ports.forEach(port => {
      $("select[name='port']").append("<option value='" + port.path + "'>" + port.path + "</option>")
    })
  })
}

function closeWin() {
  require('electron').ipcRenderer.send('window-close')
}

function exportLog() {}

function clearLog() {
  $("#log").empty()
}

function setSp() {
  if ($("#sp-btn-text").text() === "OPEN") {
    port = new serialport($("select[name='port']").val(), {
      baudRate: parseInt($("select[name='baud']").val()),
      dataBits: parseInt($("select[name='data']").val()),
      stopBits: parseInt($("select[name='stop']").val()),
      parity: $("select[name='parity']").val(),
      rtscts: $("input[type='rtscts']").is(':checked'),
      autoOpen: false
    })
    port.open(err => {
      if (err) {
        alert(err)
        return
        // return console.log('Error opening port: ', err.message)
      }
      // Because there's no callback to write, write errors will be emitted on the port:
      // port.write('main screen turn on')
    })
    port.on('open', () => {
      // console.log('open')
      $("#sp-btn-text").text("CLOSE")
      $("#sp-btn-switch").addClass("layui-btn-danger")
      $("#log").append("Serial Port Open.\n\n")
    })
    port.pipe(new StringStream())
      .lines('\n')
      .each(
        data => {
          $("#log").append(formatRx(data))
          $("#log").scrollTop($("#log")[0].scrollHeight)
        }
      )
  } else {
    port.close(err => {
      // console.log('port closed', err)
      $("#log").append("Serial Port Closed.\n")
      $("#log").scrollTop($("#log")[0].scrollHeight)
      $("#sp-btn-text").text("OPEN")
      $("#sp-btn-switch").removeClass("layui-btn-danger")
    })
    port = null
  }
}

function sendCmd() {
  // console.log(getDate() + '\n\t' + $("#input-send").val())
  // $("#log").append('T - ' + getDate() + '\n\t' + $("#input-send").val() + "\n\n")
  $("#log").append(formatTx($("#input-send").val()))
  $("#log").scrollTop($("#log")[0].scrollHeight)
  $("#input-send").val("")
}

function formatTx(s) {
  return 'T - ' + getDate() + '\n\t' + s + "\n\n"
}

function formatRx(s) {
  return 'R - ' + getDate() + '\n\t' + s + "\n\n"
}

function formatDate(s) {
  return s < 10 ? '0' + s : s;
}

function getDate() {
  let nowDate = new Date()
  let hour = nowDate.getHours()
  let min = nowDate.getMinutes()
  let sec = nowDate.getSeconds()
  let msec = nowDate.getMilliseconds()
  return formatDate(hour) + ':' + formatDate(min) + ':' + formatDate(sec) + ',' + msec
}
