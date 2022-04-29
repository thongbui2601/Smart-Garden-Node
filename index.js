import express from 'express';
import fetch from 'node-fetch';

import { createRequire } from "module";
const require = createRequire(import.meta.url);


// firebase
var admin = require("firebase-admin");

var serviceAccount = require("./util/myfirebase-dbb-2cc3a42c0a56.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://myfirebase-dbb-default-rtdb.asia-southeast1.firebasedatabase.app"
});


const createAlert = (type, currVal, min, max) => {
    const content = type + " is out of range. Current value is " + currVal + " and range is [" + min + ",  " + max + "]";
    const todoRef = admin.database().ref('Notifications');
    todoRef.push(content);
}



const setData = async () => {
    const tempResponse = await fetch('https://io.adafruit.com/api/v2/trong249/feeds/bbc-temp/data');
    const temp = await tempResponse.json();
    const tempValue = temp[0].value;
    const humidResponse = await fetch('https://io.adafruit.com/api/v2/trong249/feeds/bbc-humi/data');
    const humid = await humidResponse.json();
    const humidValue = humid[0].value;

    const lightResponse = await fetch('https://io.adafruit.com/api/v2/trong249/feeds/bbc-light/data');
    const light = await lightResponse.json();
    const lightValue = light[0].value;

    const grHumidResponse = await fetch('https://io.adafruit.com/api/v2/trong249/feeds/bbc-humi-ground/data');
    const grHumid = await grHumidResponse.json();
    const grHumidValue = grHumid[0].value;

    // console.log(tempValue, humidValue, lightValue, grHumidValue);


    admin.database().ref('Min_max').on("value", (snapshot) => {
        snapshot.forEach((child) => {
            // if temperature
            if (child.key === "temperature") {
                if(tempValue > child.val().max || tempValue < child.val().min) {
                    createAlert("Temperature", tempValue, child.val().min, child.val().max);
                }
            }
            else if (child.key === "humid") {
                if(humidValue > child.val().max || humidValue < child.val().min) {
                    createAlert("Humidity", humidValue, child.val().min, child.val().max);
                }
            }
            else if (child.key === "light") {
                if(lightValue > child.val().max || lightValue < child.val().min) {
                    createAlert("Light", lightValue, child.val().min, child.val().max);
                }
            }
            else if (child.key === "ground_humid") {
                if(grHumidValue > child.val().max || grHumidValue < child.val().min) {
                    createAlert("Ground Humidity", grHumidValue, child.val().min, child.val().max);
                }
            }
        });
    });

}

// setInteval
setInterval(setData, 10000);

// var firebase = require('firebase');
// firebase.initializeApp({
//     databaseURL: 'https://myfirebase-dbb-default-rtdb.asia-southeast1.firebasedatabase.app',
//     credential: './util/myfirebase-dbb-2cc3a42c0a56.json', // This is the serviceAccount.json file
// });


const app = express();
const PORT = process.env.PORT || 5000;

// // fetch data from api link
// const response = await fetch('https://io.adafruit.com/api/v2/trong249/feeds/bbc-led/data');
// const data = await response.json();




app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/myapi", (req, res) => {
    res.send("Api here bro!");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});