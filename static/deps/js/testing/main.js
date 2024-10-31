window.DEBUG_MODE = false;

const worker_path = `/static/deps/js/testing/socketWorker.js`;

const market_url = 'wss://wbs.mexc.com/ws';
const method = 'SUBSCRIPTION';
const workers = []
const all_symbols = document.getElementsByClassName('coin_symbol');
let results = [];

function createWorker(symbol){
    const params = [`spot@public.deals.v3.api@${symbol}USDT`];
    const worker = new Worker(worker_path);

    worker.postMessage({market_url, method, params});

    worker.addEventListener('message', (event) => {
        console.log("From main thread worker logs: ", event.data);

        if(event.data) {
            console.log(`event data ${symbol}` , event.data)
            updateCoinPrice(symbol, event.data.price)
        }
    });

    workers.push(worker);
}
console.log('Main thread is running.');

function updateCoinPrice(symbol, newPrice) {
        console.log("updateCoinPrice: ",  symbol , " ", newPrice);

    const coinItems = Array.from(document.querySelectorAll('.coin_item_wrapper'));
    const coinItem = coinItems.find(item => item.querySelector('.coin_item').getAttribute('data-symbol') === symbol); // Шукаємо відповідний символ
    console.log("coinItem ", coinItem);
    if (coinItem) {
            coinItem.querySelector('.coin.price').textContent = newPrice; // Оновлюємо ціну
    }
}


Array.from(all_symbols).forEach(symbol => {

    createWorker(symbol.textContent);
});


