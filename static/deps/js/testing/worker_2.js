self.onmessage = function(event) {
    const { market_url, method, params } = event.data;

    // Log received data to verify
    console.log('Received data in Web Worker:', event.data);
    const socket = new WebSocket(market_url);

    socket.addEventListener('open', () => {
        console.debug('WebSocket opened', event.data);

        const tradeStr = JSON.stringify({method:method, params:params});

        socket.send(tradeStr);
    });
    socket.addEventListener('message', (event) => {
        const receivedData = event.data;
        console.log("Received data", receivedData, ", time: ", Date.now());

        const symbol = params[0].match(/@(\w+)USDT$/)[1];
        const processedData = {price: 'waiting...', volume : 'waiting...', symbol: symbol};
       // parsing data
       try  {
            const parsedData = JSON.parse(receivedData);
             if (parsedData.d && parsedData.d.deals && parsedData.d.deals.length > 0) {
                  processedData.price = parsedData.d.deals[0].p;
                  processedData.volume = parsedData.d.deals[0].v;
             }
             else {
                console.warn("Deals array is empty or missing. receivedData: ", receivedData);
             }
       }
        catch (error) {
           console.error("Error parsing JSON:", error);
        }

        console.log("ProcessedData send to main thread msg: ", processedData, ", time: ", Date.now());

        self.postMessage(processedData);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');

    });

};