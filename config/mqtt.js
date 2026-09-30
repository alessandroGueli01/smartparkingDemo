/*// mqttPublisher.js
const mqtt = require('mqtt');

// Configurazione della connessione al broker
const brokerUrl = 'mqtt://localhost:1883'; // Sostituisci con l'indirizzo del tuo broker Mosquitto

const options = {
    reconnectPeriod: 5000,  // Riprova la connessione ogni 5s in caso di errore
};

const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
    console.log('✅ Connesso a MQTT');
});

client.on('error', (err) => {
    console.error('❌ Errore MQTT:', err);
});


function inviaNotifica(topic, messaggio) 
{
    if (!client.connected) 
        {
            console.error('Connessione al broker MQTT non disponibile.');
            return;
        }
    client.publish(topic, messaggio, (error) => 
    {
        if (error) {console.error('Errore nell\'invio della notifica:', error);} 
        else {console.log(`Notifica inviata al topic "${topic}": ${messaggio}`);}
    });
}

module.exports = { inviaNotifica };
*/

const mqtt = process.env.NODE_ENV !== "test" ? require('mqtt') : null;

let client = { 
    publish: jest.fn(), 
    connected: false 
}; // Mock client per Jest

if (process.env.NODE_ENV !== "test") {
    const brokerUrl = 'mqtt://localhost:1883';
    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('✅ Connesso a MQTT');
    });

    client.on('error', (err) => {
        console.error('❌ Errore MQTT:', err);
    });
}

module.exports = { client };
