package com.pissir.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class MQTTService {
    private MqttClient client;
    private final String broker = "tcp://localhost:1883";

    @PostConstruct
    public void init() {
        try {
            client = new MqttClient(broker, MqttClient.generateClientId());
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setAutomaticReconnect(true);
            opts.setCleanSession(true);
            client.connect(opts);
        } catch (MqttException e) {
            System.err.println("MQTT connect failed: " + e.getMessage());
        }
    }

    public void publish(String topic, String payload) {
        if (client == null || !client.isConnected()) return;
        try {
            MqttMessage msg = new MqttMessage(payload.getBytes());
            msg.setQos(1);
            client.publish(topic, msg);
        } catch (MqttException e) {
            System.err.println("MQTT publish error: " + e.getMessage());
        }
    }
}
