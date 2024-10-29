// algo getting data from marketplace
const socket = new WebSocket('wss://wbs.mexc.com/ws'); // api url

symbol = "BTCUSDT"
method = "SUBSCRIPTION"
params = [method, ["spot@public.deals.v3.api@" + symbol]]

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data); // receiving data

  // validation data
  const processedData = {
    price: data.price,
    volume: data.volume
  };

  // send data to main stream for update DOM
  self.postMessage(processedData);
});