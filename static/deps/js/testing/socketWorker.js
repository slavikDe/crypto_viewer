self.addEventListener('message', (event) => {
    const { url, method, params } = event.data;

    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {
        console.log('WebSocket opened', params);

        const tradeStr = JSON.stringify({ method, params });
        socket.send(tradeStr);
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        const processedData = {
            price: data.price || 'N/A',
            volume: data.volume || 'N/A'
        };

        self.postMessage(processedData);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket closed');
    });
});
