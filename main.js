const cron = require('cron').CronJob
const Runner = require('./runner.js')
const express = require('express')
const settings = require('./settings.json')

r = new Runner('192.168.2.102')
var alarm_data

const evening_scheduler = new cron(settings['evening_schedule'], function() {
    r.off()
})

evening_scheduler.start()
console.log("Successfully started evening scheduler!")

const app = express()
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())

app.post('/alarm_data', (req, res) => {
    // Handling the POST request and checking it for a valid token
    alarm_data = req.body
    if (alarm_data['token'] == settings['token']) {
        parseAlarmData(alarm_data)
        res.end('Success')
    }
    else {
        res.status(403)
        res.render()
    }
})

function parseAlarmData(data) {
    // Parsing the minutes and hours out of the received alarm info
    time = data['info'].split(':')[0].split('')
    console.log("Received new alarm input: " + time[1] + "h " + time[0] + "min")

    // Checking if the morning_scheduler cron already exists and deleting it
    if (typeof morning_scheduler !== 'undefined') {
        morning_scheduler.stop()
        morning_scheduler = ''
    } 

    // Defining the morning_scheduler cron for turning the lights on based on the alarm info
    var morning_scheduler = new cron(time[0] + ' '+ time[1] + ' * * *', function() {
        r.power()
    })
    morning_scheduler.start()
    console.log("Successfully scheduled lights for " + time[1] + "h " + time[0] + "min!")
}

const server = app.listen(3000)
console.log("HTTP-Server listening on 3000")