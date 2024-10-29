

const url = 'wss://wbs.mexc.com/ws';
const symbol = 'BTCUSDT';
const method = 'SUBSCRIPTION';
const params = [method, [`spot@public.deals.v3.api@${symbol}`]];

const worker = new Worker('/static/deps/js/testing/socketWorker.js');
worker.postMessage({ url, method, params });

worker.addEventListener('message', (event) => {
    const data = event.data;
    document.getElementById('liveData').textContent =
        `Ціна: ${data.d.deals.p}, Обсяг: ${data.volume}`;
});
