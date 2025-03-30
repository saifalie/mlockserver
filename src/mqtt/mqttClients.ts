// src/mqtt/mqtt.ts
import mqtt, { MqttClient } from 'mqtt';

let mqttClient: MqttClient;

export const initializeMQTT = () => {
  try {
    console.log('Attempting MQTT connection...');
    
    mqttClient = mqtt.connect('mqtts://f5d725c22de443d28542a36506b7fd33.s1.eu.hivemq.cloud', {
      port: 8883,
      username: 'Jayesh',
      password: 'Jayesh_001',
      rejectUnauthorized: false
    });

    // Connection events
    mqttClient.on('connect', () => {
      console.log('✅ MQTT connected to broker');
      mqttClient.subscribe('esp32/led', (err) => {
        if (err) {
          console.error('❌ Subscription error:', err);
          return;
        }
        console.log('🔔 Subscribed to topic: esp32/led');
      });
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT error:', err);
    });

    mqttClient.on('close', () => {
      console.log('🔴 MQTT connection closed');
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 Attempting MQTT reconnection...');
    });

    // Message handler
    mqttClient.on('message', (topic, message) => {
      console.log(`📩 Received MQTT message [${topic}]: ${message.toString()}`);
    });

    return mqttClient;

  } catch (error) {
    console.error('❌ MQTT initialization failed:', error);
    process.exit(1);
  }
};

export const sendCommand = (command: string) => {
  if (!mqttClient || !mqttClient.connected) {
    throw new Error('MQTT client not connected');
  }

  try {
    mqttClient.publish('esp32/led', command, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to send command "${command}":`, err);
        return;
      }
      console.log(`📤 Successfully sent command: "${command}"`);
    });
  } catch (error) {
    console.error('❌ Unexpected error in sendCommand:', error);
    throw error;
  }
};