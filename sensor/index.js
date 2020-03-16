const awsIot = require("aws-iot-device-sdk");

//load the settings file that contains the location of the device certificates and the clientId of the sensor
var settings = require("./settings.json");

//load the sensor records
var sensors = require("./sensors.json");

//constants used in the application
const VALUE_TOPIC = "dt/coreone/[id]/[deviceId]/all"; //topic to which sensor values will be published
const CREATE_TOPIC = "cmd/sensors/[id]/sensor-create"; //topic to which the create sensor request will be published
const VALUE_RATE = 2000; //rate in milliseconds new values will be published to the Cloud

//initialize the IOT device
var device = awsIot.device(settings);

//create a placeholder for the message
var msg = {
  temperature: 0,
  state: false,
  pressure: 0,
  flow: 0,
  energy: 0,
  uv: 0,
  timestamp: new Date().getTime()
};

device.on("connect", function() {
  console.log("connected to IoT Hub");

  //loop all sensors - initiating publishing a create-sensor message
  sensors.forEach(item => {
    //publish a message to the create topic - this will trigger the sensor to be created by the app API
    var topic = CREATE_TOPIC.replace("[id]", item.id);
    item = { ...msg, ...item };

    device.publish(topic, JSON.stringify(item));

    console.log("published to topic " + topic + " " + JSON.stringify(item));
  });

  //publish new value readings very 2 seconds
  setInterval(sendSensorState, VALUE_RATE);
});

device.on("error", function(error) {
  console.log("Error: ", error);
});

function sendSensorState() {
  sensors.forEach(item => {
    msg.temperature = 5 + Math.floor(Math.random() * 600) / 10;
    msg.energy = Math.floor(Math.random() * 1000) / 10;
    msg.uv = Math.floor(Math.random() * 1000) / 10;
    msg.flow = Math.floor(Math.random() * 1000) / 10;
    msg.pressure = Math.floor(Math.random() * 1000) / 10;
    msg.timestamp = new Date().getTime();

    var topic = VALUE_TOPIC.replace("[id]", item.id);
    topic = topic.replace("[deviceId]", item.deviceId);
    device.publish(topic, JSON.stringify(msg));

    console.log("published to topic " + topic + " " + JSON.stringify(msg));
  });
}
