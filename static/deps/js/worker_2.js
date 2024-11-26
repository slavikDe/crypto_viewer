self.onmessage = function(event) {
    const { url, method, params } = event.data;
    // console.log("parced data onmaessage: ",url, method, params);
    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {

        const tradeStr = JSON.stringify({method:method, params:params});
        // console.log("worker opened, tradeStr: ", tradeStr);

        socket.send(tradeStr);
    });
    socket.addEventListener('message', (event) => {
        const receivedData = event.data;
        console.log("socket listener event data: ", event.data);

        const processedData = {price: 'waiting...', volume : 'waiting...', symbol: ""};
        // parsing data
       try  {
            const parsedData = JSON.parse(receivedData);
             if (parsedData.d && parsedData.d.deals && parsedData.d.deals.length > 0) {
                  processedData.price = parsedData.d.deals[0].p;
                  processedData.volume = parsedData.d.deals[0].v;
                  processedData.symbol = parsedData.s;
             }
             else {
                console.warn("Deals array is empty or missing. receivedData: ", receivedData);
             }
       }
        catch (error) {
           console.error("Error parsing JSON:", error);
        }

        // console.log("ProcessedData send to main thread msg: ", processedData, ", time: ", Date.now());
        self.postMessage(processedData);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');

    });

};