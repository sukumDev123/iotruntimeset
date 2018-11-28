const firebase = require("firebase")
const config = require("./config")
const aboutTime = require("./logic/updateTime")
const port = process.env.PORT || 5000
const express = require("express")
const http = require("http")
const path = require("path")
const cors = require("cors")
let keyObjects = []
let dataObjects = []
if (config.apiKey) {
  firebase.initializeApp(config)

  const starCountRef = firebase.database().ref("bulb-parant")
  starCountRef.on("value", function(snapshot) {
    console.log("New data in realtime database.")
    keyObjects = Object.keys(snapshot.val())
    dataObjects = snapshot.val()
  })
  setInterval(() => {
    if (keyObjects.length > 0) {
      console.log("Doing now 5 s.")
      const updateonissuccess = aboutTime.updateTimeOpen(
        keyObjects,
        dataObjects,
        firebase
      )
      const updateoffissuccess = aboutTime.updateTimeClose(
        keyObjects,
        dataObjects,
        firebase
      )

      keyObjects = keyObjects.filter(
        key => dataObjects[key].setOpen || dataObjects[key].setClose
      )
      console.log("This filed set time :", keyObjects)
    }
  }, 1000)
} else {
  console.log("You not have api key.")
}
const app = express()
app.use(cors())
app.get("/stack", cors(), (req, res) => {
  res.sendFile(path.resolve("./index.html"))
})
app.get("**", (req, res) => {
  res.send(
    "If you want to view stack of bulbs . You can go to this path --> /stack"
  )
})
const httpClient = http.createServer(app).listen(port, () => {
  console.log("Connect listen  ;" + port)
})
var io = require("socket.io")(httpClient)
io.on("connection", function(socket) {
  setInterval(() => {
    socket.emit("news", { hello: keyObjects })
  }, 1000)
  socket.on("my other event", function(data) {
    console.log(data)
  })
})
