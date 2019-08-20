var editorExtensionId = "hlidoiggojpiieodjnlncgohahlmhkkp";

class HeartRateMonitor {
  constructor() {
    this.SERVICE_ID = 0x1800;
    this.CHARACTERISTIC_ID = 'befdff60-c979-11e1-9b21-0800200c9a66';
    this.UNK_ID = 'befdff20-c979-11e1-9b21-0800200c9a66';
    
    this.hrElement_ = document.getElementById('hr');
    this.brElement_ = document.getElementById('br');
  }
    //this.hrElement_.textContent = hr;
    //this.avgElement_.textContent = this.computeAverage_();
  start() {
    /*this.resetAverage_();*/
    let options = {
      filters: [
        {services: ['befdff20-c979-11e1-9b21-0800200c9a66']},
        {services: [this.SERVICE_ID]},
        {name: 'BH BHT015426'}
     ]}
    navigator.bluetooth.requestDevice(options)
        .then(device => {
          console.log("Connected to " + device.name);
          return device.gatt.connect();
        })
        .then(server => {
          return server.getPrimaryService('befdff20-c979-11e1-9b21-0800200c9a66');
        })
        .then(service => {
          return service.getCharacteristic(this.CHARACTERISTIC_ID);
        })
        /*.then(characteristic => this.handleCharacteristic_(characteristic));*/
        .then(characteristic => {
          characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged(event)); /*function(event){
              var result = handleCharacteristicValueChanged(event);
              this.hrElement_.textContent = result[0];
              this.brElement_.textContent = result[1];
          }, false);
          */                          
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
function handleCharacteristicValueChanged(event, hrElement_, brElement_) {
  var value = event.target.value;
  let hr = value.getUint8(3);
  let br = value.getUint8(4);
  let brOverflow = value.getUint8(5);
  if(brOverflow == 1) {
    br = br + 256;
  }
  br = br/10;
  console.log("Parsed hr: " + hr);
  console.log("Parsed br: " + br);
  console.log("Extra br info: " + brOverflow);
  /*
  chrome.runtime.sendMessage(editorExtensionId, {messageFromWeb: hr},
    function(response) {
      if (!response.success)
        handleError(url);
  });
  */
 }
