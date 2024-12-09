self.onmessage = function(event) {
    const { url, method, params, exchange } = event.data;
    // console.log("Worker url: ", url, " method: ", method, " params: ", params);
    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {

        const tradeStr = JSON.stringify({method:method, params:params});

        socket.send(tradeStr);
    });
    socket.addEventListener('message', (event) => {
        const receivedData = JSON.parse(event.data);
        // console.log("receivedData: ", receivedData);
        // console.log("received data p: ", receivedData.p);
        // parsing data
       try  {
           // if(exchange==='Binance'){
           //     console.log('exchange: ', exchange);
           // }else if(exchange==='MEXC') {
           //     console.log('exchange: ', exchange);
           // }

            if (receivedData) {
                // console.log("Valid data received: ", receivedData);
                self.postMessage(receivedData);
            }  else {
                console.warn("Deals array is empty or missing. receivedData: ", receivedData);
            }
       }
        catch (error) {
           console.error("Error parsing JSON:", error);
        }
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');

    });

};