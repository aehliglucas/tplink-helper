const { Client } = require('tplink-smarthome-api')

class Runner {

    constructor(host) {
        this.host = host
    }

    power() {
        const client = new Client()
        client.getDevice({ host: this.host }).then((device) => {
            device.setPowerState(true)
        });
    }

    off() {
        const client = new Client()
        client.getDevice({ host: this.host }).then((device) => {
            device.setPowerState(false)
        });
    }

}

module.exports = Runner;