const mqtt = process.env.NODE_ENV !== "test" ? require('mqtt') : null;

let client = { 
    publish: jest.fn(), 
    connected: false 
}; // Mock client per Jest

if (process.env.NODE_ENV !== "test") {
    const brokerUrl = 'mqtt://localhost:1883';
    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('Connesso a MQTT');
    });

    client.on('error', (err) => {
        console.error('Errore MQTT:', err);
    });
}

module.exports = { client };
