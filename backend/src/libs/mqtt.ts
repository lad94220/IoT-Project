import mqtt, { MqttClient } from 'mqtt'

export const connectToMQTT = (): MqttClient => {
  const brokerUrl = process.env.MQTT_BROKER_URL
  const port = 8883
  const username = process.env.MQTT_USERNAME
  const password = process.env.MQTT_PASSWORD
  const topic1 = process.env.MQTT_TOPIC_RECEIVE
  const topic2 = process.env.MQTT_TOPIC_ACTIVATE
  const topic3 = process.env.MQTT_TOPIC_ALIVE

  if (!brokerUrl) throw new Error('MQTT_BROKER_URL is not defined in environment variables.')

  const client = mqtt.connect({
    host: brokerUrl,
    protocol: 'mqtts',
    port: port,
    username: username,
    password : password,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000, //30s
  })

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker')
    if (topic1) {
      client.subscribe(topic1, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to topic ${topic1}:`, err)
        } else {
          console.log(`✅ Subscribed to topic ${topic1}`)
        }
      })
    } else {
      console.warn('⚠️ No MQTT_TOPIC_RECEIVE defined, not subscribing to any topic.')
    }
    if (topic2) {
      client.subscribe(topic2, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to topic ${topic2}:`, err)
        } else {
          console.log(`✅ Subscribed to topic ${topic2}`)
        }
      })
    } else {
      console.warn('⚠️ No MQTT_TOPIC_ACTIVATE defined, not subscribing to any topic.')
    }
    if (topic3) {
      client.subscribe(topic3, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to topic ALIVE:`, err)
        } else {
          console.log(`✅ Subscribed to topic ALIVE`)
        }
      })
    } else {
      console.warn('⚠️ No MQTT_TOPIC_ALIVE defined, not subscribing to any topic.')
    }
  })

  client.on('error', (err) => {
    console.error('❌ MQTT connection error:', err)
  })

  return client;
};
