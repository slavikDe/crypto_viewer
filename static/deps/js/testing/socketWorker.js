self.addEventListener('message', (event) => {
    const { market_url, method ,params } = event.data;

    const socket = new WebSocket(market_url);

    socket.addEventListener('open', () => {
        console.debug('WebSocket opened', event.data);

        const tradeStr = JSON.stringify({method:method, params:params});

        socket.send(tradeStr);
    });

    socket.addEventListener('message', (event) => {
        const receivedData = event.data;
        console.log("Received data", receivedData);

        const processedData = {price: 'na', volume : 'na'}
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

        self.postMessage(processedData);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');

    });
});
