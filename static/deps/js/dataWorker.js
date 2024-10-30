// algo getting data from marketplace
const socket = new WebSocket('wss://wbs.mexc.com/ws'); // api url

symbol = "BTCUSDT"
method = "SUBSCRIPTION"
params = [method, ["spot@public.deals.v3.api@" + symbol]]

socket.addEventListener('message', (event) => {
  // const data = JSON.parse(event.data); // receiving data
  //
  // // validation data
  // const processedData = {
  //   price: data.price,
  //   volume: data.volume
  // };

   // try {
   //      const data = JSON.parse(event.data);
   //
   //      if (data.d && data.d.deals && data.d.deals.length > 0) {
   //          const price = data.d.deals[0].p;
   //          setPrice(price);
   //      } else {
   //          console.warn("Deals array is empty or missing.");
   //      }
   //  } catch (error) {
   //      console.error("Error parsing JSON:", error);
   //  }

  // send data to main stream for update DOM
  self.postMessage(processedData);
});