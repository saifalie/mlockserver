

import mqtt from "mqtt";
import { InternalException } from "../errors/internal-exception.js";
import { ErrorCode } from "../errors/root.js";
import { EventEmitter } from "events";

export class RelayMQTTClient extends EventEmitter {
    private client: mqtt.MqttClient | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number;
    private reconnectTimeout: number;

    // MQTT configuration
    private readonly BROKER_URL = process.env.MQTT_BROKER_URL;
private readonly PORT = parseInt(process.env.MQTT_PORT || '8883');
private readonly USERNAME = process.env.MQTT_USERNAME;
private readonly PASSWORD = process.env.MQTT_PASSWORD;
    private readonly CLIENT_ID = "nodejs-server";
    
    private readonly TOPICS = {
        RELAY_CONTROL: "esp8266/relay",  
        STATUS_UPDATE: "esp8266/ir"   
    };

    constructor(options: {
      maxReconnectAttempts?: number,
      reconnectTimeout?: number
  } = {}) {
      super();
      // Verify environment variables first
      if (!process.env.MQTT_BROKER_URL || !process.env.MQTT_USERNAME || !process.env.MQTT_PASSWORD) {
          throw new Error('Missing MQTT environment variables');
      }
      this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
      this.reconnectTimeout = options.reconnectTimeout || 5000;
      this.connect();
  }

    private connect() {
        try {
          this.client = mqtt.connect(this.BROKER_URL!, {
            port: this.PORT,
            username: this.USERNAME,
            password: this.PASSWORD,
            clientId: this.CLIENT_ID + "_" + Math.random().toString(16).substr(2, 8), // Add randomness to prevent conflicts
            keepalive: 60,
            reconnectPeriod: 1000, // Enable auto-reconnect with 1 second delay
            connectTimeout: 30000, // 30 second timeout
            clean: true, // Use clean session
            rejectUnauthorized: false // For testing only
        });

            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.client!.subscribe(this.TOPICS.STATUS_UPDATE);
                this.emit('connected');
            });

            this.client.on('message', (topic, message) => {
                const msg = message.toString();
                console.log(`Received message on ${topic}: ${msg}`);
                
                if (topic === this.TOPICS.STATUS_UPDATE) {
                    this.emit('status', msg);
                }
            });

            this.client.on('close', () => {
                console.log('Disconnected from MQTT broker');
                this.isConnected = false;
                this.handleReconnection();
            });

            this.client.on('error', (err) => {
                console.error('MQTT error:', err);
                this.isConnected = false;
                this.handleReconnection();
            });

        } catch (error) {
            console.log('Connection setup error:', error);
            this.handleReconnection();
        }
    }

    private handleReconnection() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
              // Destroy old client before reconnecting
              if (this.client) {
                  this.client.removeAllListeners();
                  this.client.end();
              }
              this.connect();
          }, this.reconnectTimeout);
      } else {
          console.log('Max reconnect attempts reached');
          this.emit('maxReconnectReached');
      }
  }

    public async sendCommand(command: "OPEN" | "CLOSE",topic:string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected || !this.client) {
                return reject(new InternalException(
                    'Not connected to MQTT broker',
                    ErrorCode.INTERNAL_EXCEPTION,{message:'Not connected to MQTT broker'}
                ));
            }

            this.client.publish(topic, command, (err) => {
                if (err) {
                    console.error('Failed to publish message:', err);
                    return reject(err);
                }
                console.log(`Published "${command}" to ${topic}`);
                resolve(`Published "${command}" to ${topic}`);
            });
        });
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.isConnected = false;
        }
    }
}

let mqttClientInstance: RelayMQTTClient | null = null;

export function getMQTTClient(): RelayMQTTClient {
    if (!mqttClientInstance) {
        mqttClientInstance = new RelayMQTTClient();
    }
    return mqttClientInstance;
}










// // src/mqtt/mqtt.ts
// import mqtt, { MqttClient } from 'mqtt';

// let mqttClient: MqttClient;

// export const initializeMQTT = () => {
//   try {
//     console.log('Attempting MQTT connection...');
    
//     mqttClient = mqtt.connect('mqtts://f5d725c22de443d28542a36506b7fd33.s1.eu.hivemq.cloud', {
//       port: 8883,
//       username: 'Jayesh',
//       password: 'Jayesh_001',
//       rejectUnauthorized: false
//     });

//     // Connection events
//     mqttClient.on('connect', () => {
//       console.log('✅ MQTT connected to broker');

//       const subscriptions = ['esp32/led', 'esp32/status'];
//       mqttClient.subscribe('esp32/led', (err) => {
//         if (err) {
//           console.error('❌ Subscription error:', err);
//           return;
//         }
//         console.log(`🔔 Subscribed to topics: ${subscriptions.join(', ')}`);
//       });
//     });

//     mqttClient.on('error', (err) => {
//       console.error('❌ MQTT error:', err);
//     });

//     mqttClient.on('close', () => {
//       console.log('🔴 MQTT connection closed');
//     });

//     mqttClient.on('reconnect', () => {
//       console.log('🔄 Attempting MQTT reconnection...');
//     });

//     // Message handler
//     mqttClient.on('message', (topic, message) => {
//       const payload = message.toString();
//       console.log(`📩 Received MQTT message [${topic}]: ${payload}`);

//       if (topic === 'esp32/status') {
//         // Handle status updates (OPEN/CLOSE)
//         console.log(`🔄 Device status update: ${payload}`);
//         // Add your business logic here (e.g., store in DB, trigger actions)
//       }
//     });

//     return mqttClient;

//   } catch (error) {
//     console.error('❌ MQTT initialization failed:', error);
//     process.exit(1);
//   }
// };

// export const sendCommand = (command: string) => {
//   if (!mqttClient || !mqttClient.connected) {
//     throw new Error('MQTT client not connected');
//   }

//   try {
//     mqttClient.publish('esp32/led', command, { qos: 1 }, (err) => {
//       if (err) {
//         console.error(`❌ Failed to send command "${command}":`, err);
//         return;
//       }
//       console.log(`📤 Successfully sent command: "${command}"`);
//     });
//   } catch (error) {
//     console.error('❌ Unexpected error in sendCommand:', error);
//     throw error;
//   }
// };