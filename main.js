const cron = require('cron').CronJob
const Runner = require('./runner.js')
const express = require('express')
const settings = require('./settings.json')

r = new Runner('192.168.2.102')
var alarm_data
var morning_scheduler

// Creating the evening scheduler
const evening_scheduler = new cron(settings['evening_schedule'], function() {
    r.off()
})

evening_scheduler.start()
console.log("Successfully started evening scheduler!")

// Defining settings for express
const app = express()
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())

app.post('/submit_alarm', (req, res) => {
    // Handling the POST request and checking it for a valid token
    var d = new Date().toUTCString()
    console.log("[ " + d + " ]\nReceived new alarm input from " + req.ip)
    alarm_data = req.body
    if (alarm_data['token'] == settings['token']) {
        // Calling parseAlarmData which will parse the alarm
        parseAlarmData(alarm_data)
        res.end('Success')
    }
    else {
        res.status(403)
        res.render()
    }
})

app.post('/disable_alarm', (req, res) => {
    // Handling the POST request and checking it for a valid token
    var d = new Date().toUTCString()
    console.log("[ " + d + " ]\nReceived new deletion input from " + req.ip)
    req_data = req.body
    if (req_data['token'] == settings['token']) {
        // Calling disableAlarm which will disable the schedule
        disableAlarm()
        res.end('Success')
    }
    else {
        res.status(403)
        res.render()
    }
})

function parseAlarmData(data) {
    // Parsing the minutes and hours out of the received alarm info
    time = data['info'].split('')
    console.log("Parsed last alarm input: " + time[0] + time[1] + ":" + time[3] + time[4])

    // Checking if the morning_scheduler cron already exists and deleting it
    if (typeof morning_scheduler !== 'undefined') {
        morning_scheduler.stop()
        morning_scheduler = ''
    } 

    // Defining the morning_scheduler cron for turning the lights on based on the alarm info
    morning_scheduler = new cron(time[3] + time[4] + ' '+ time[0] + time[1] + ' * * *', function() {
        r.power()
    })
    morning_scheduler.start()
    console.log("Successfully scheduled lights for " + time[0] + time[1] + ":" + time[3] + time[4] + "! (Cron-schedule: " + time[3] + time[4] + ' '+ time[0] + time[1] + ' * * *' + ")\n--------------------")
}

function disableAlarm() {
    if (typeof morning_scheduler !== 'undefined') {
        morning_scheduler.stop()
        morning_scheduler = ''
    }
}

// Finally starting express
const server = app.listen(3000)
console.log("HTTP-Server listening on 3000\n--------------------")