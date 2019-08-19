var editorExtensionId = "hlidoiggojpiieodjnlncgohahlmhkkp";

class HeartRateMonitor {
  constructor() {
    this.SERVICE_ID = 0x1800;
    this.CHARACTERISTIC_ID = 0x2A37;
    this.UNK_ID = 'befdff20-c979-11e1-9b21-0800200c9a66';
    
    this.hrElement_ = document.getElementById('hr');
    this.avgElement_ = document.getElementById('avg');
    
    this.resetAverage_();
  }

  computeAverage_() {
    if (this.timeSum_ > 0) {
      let avg = this.hrSum_ / ((this.timeSum_) * 2);
      return avg.toFixed(1);
    }
    return '0.0';
  }

  resetAverage_() {
    this.lastTick_ = 0;
    this.lastHr_ = 0;
    this.hrSum_ = 0;
    this.timeSum_ = 0;
  }
  
  parseHeartRate_(data) {
    let flags = data.getUint8(0);
    if (flags & 0x1) {
      return data.getUint16(1, true);
    }
    return data.getUint8(1);
  }

  onHeartRateChanged_(event) {
    console.log("Heart rate changed: " + event);
    let dataView =  event.target.value;
    console.log("Raw hr data: " + dataView);
    let tick = (new Date()).getTime();
    let hr = this.parseHeartRate_(dataView);
    console.log("Parsed hr: " + hr);
    chrome.runtime.sendMessage(editorExtensionId, {messageFromWeb: hr},
      function(response) {
        if (!response.success)
          handleError(url);
    });
    
    // Ignore readings where the HR or last HR value is 0 - treat this as a
    // failed reading from the sensor.
    if (this.lastTick_ && hr && this.lastHr_) {
      this.hrSum_ += (tick - this.lastTick_) * (hr + this.lastHr_);
      this.timeSum_ += tick - this.lastTick_;
    }
    this.lastTick_ = tick;
    this.lastHr_ = hr;
    
    this.hrElement_.textContent = hr;
    //this.avgElement_.textContent = this.computeAverage_();
  }

  handleCharacteristic_(characteristic) {
    characteristic.addEventListener('characteristicvaluechanged',
        event => this.onHeartRateChanged_(event));
    return characteristic.startNotifications();
  }

  start() {
    this.resetAverage_();
    let options = {
      filters: [
        {services: [/*this.SERVICE_ID*/'befdff20-c979-11e1-9b21-0800200c9a66']},
        {services: [this.SERVICE_ID]},
        {name: 'BH BHT015426'}
     ]}
    navigator.bluetooth.requestDevice(options)
        .then(device => {
          console.log("Connected to " + device.name);
          return device.gatt.connect();
        })
        .then(server => {
          return server.getPrimaryService(/*this.SERVICE_ID*/'befdff20-c979-11e1-9b21-0800200c9a66');
        })
        .then(service => {
          return service.getCharacteristic(/*this.CHARACTERISTIC_ID*/'befdff60-c979-11e1-9b21-0800200c9a66');
        })
        /*.then(characteristic => this.handleCharacteristic_(characteristic));*/
        .then(characteristic => {
          console.log(characteristic);
          console.log(characteristic.properties);
          characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged',
                                  handleCharacteristicValueChanged);
          console.log('Notifications have been started.');
        })    
        /*.then(value => {
          console.log(value);
        })*/
        .catch(error => {
          console.log('Error: ' + error);
        });
  }
  
}
function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received ' + value.getBigInt64(0) + " " + value.getBigInt64(8) + " " + value.getInt32(16) + " " + value.getInt16(20) + " " + value.getInt16(21));
  // TODO: Parse Heart Rate Measurement value.
  // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
  }
