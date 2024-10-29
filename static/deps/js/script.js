class SocketConn {
    constructor(url, method, params) {
        this.url = url;
        this.method = method;
        this.params = params || [];

        this.socket = new WebSocket(this.url);

        this.socket.addEventListener('open', () => this.onOpen());
        this.socket.addEventListener('message', (event) => this.onMessage(event));
        this.socket.addEventListener('error', (error) => this.onError(error));
        this.socket.addEventListener('close', () => this.onClose());
    }

    onOpen() {
        console.log('WebSocket opened', this.params);

        const tradeStr = JSON.stringify({
            method: this.method,
            params: this.params
        });

        this.socket.send(tradeStr);
    }

    onMessage(event) {
        const data = JSON.parse(event.data);
        const processedData = {
            price: data.price || 'N/A',
            volume: data.volume || 'N/A'
        };

        document.getElementById('liveData').textContent =
            `Ціна: ${processedData.price}, Обсяг: ${processedData.volume}`;
    }

    onError(error) {
        console.error('WebSocket Error', error);
    }

    onClose() {
        console.log('WebSocket closed');
    }
}

const url = 'wss://wbs.mexc.com/ws';
const symbol = 'BTCUSDT';
const method = 'SUBSCRIPTION';
const params = [method, [`spot@public.deals.v3.api@${symbol}`]];

const socketConn = new SocketConn(url, method, params);
