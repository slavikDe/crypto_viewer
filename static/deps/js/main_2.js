const worker_path = `/static/deps/js/worker_2.js`;

// let market_url = null;
// const MEXC_base_url = 'https://api.mexc.com';
// const method = 'SUBSCRIPTION';
let method = null;
const workers = []
const exchange = document.getElementById('exchange-selector').value;
console.log("exchange: ", exchange);

// const all_symbols = Array.from(document.getElementsByClassName('coin_symbol'));
let all_symbols = [];
let base_url = null;
let ws_url = null;

// fetch(`/coins/api/coins/?exchange=${exchange}`)
fetch(`/coins/api/coins/?exchange=${exchange}`, {})
.then(response => response.json())
.then(data => {
    console.log("Coins:", data.coins);
    all_symbols = data.coins;
    // base_url = 'https://api.binance.com'
    // ws_url = 'wss://ws-api.binance.com:443/ws-api/v3'
    if(data.exchange){
        base_url = data.exchange.base_url;
        ws_url = data.exchange.ws_url;
    }
    console.log("base_url:", base_url, " ws_url:", ws_url);
    start(); // create params & open sockets
})
.catch(error => console.error("Error fetching coins: ", error));

let results = []
function createWorker(workerId, worker_path) {
    const worker = new Worker(worker_path);

    worker.onmessage = (event) => {
        // results[workerId] = event.data;
        let parsedData;
        try {
            if (exchange==='MEXC') {
                if (event.data.d) {
                    parsedData = {
                        price: parseFloat(event.data.d.deals[0].p).toFixed(4),
                        volume: parseFloat(event.data.d.deals[0].v).toFixed(4),
                        symbol: event.data.s
                    };
                    // console.log(`parsedData: ${parsedData.symbol}`, parsedData.price)
                    updateCoinInfo(parsedData.symbol, parsedData.price, parsedData.volume);
                }
            }
           else if(exchange==='Binance'){
               if (event.data.s){
                   parsedData = {
                       price: parseFloat(event.data.p).toFixed(4),
                       volume: parseFloat(event.data.q ).toFixed(4),
                       symbol: event.data.s
                   };
                   console.log("parsedData: ", parsedData)
                    updateCoinInfo(parsedData.symbol, parsedData.price, parsedData.volume);
               }
           }
           else{
               console.error("Exchange not found");
            }

        } catch (error) {
            console.error("Error creating worker: ", error);
        }
    }
    worker.onmessageerror = (error) => {
        console.error(`Error in worker-${workerId}: `, error.data);
    }
    return worker;
}

function createParams(coins_symbols, exchange){
    console.log("in createParams")
    const results = [];
    if (exchange.toLowerCase() === 'mexc') {
         for (let i = 0; i < coins_symbols.length; i++) {
            results.push(`spot@public.deals.v3.api@${coins_symbols[i].toUpperCase()}USDT`)
         }
         method = 'SUBSCRIPTION'
    }
    else if(exchange.toLowerCase() === 'binance'){
        for (let i = 0; i < coins_symbols.length; i++) {
            results.push(`${coins_symbols[i].toLowerCase()}usdt@trade`)
        }
        method = 'SUBSCRIBE'
    }

    console.log("method: ", method);
    return results;
}

function start() {
    const tasks = [];
    const chunkSize = 20;
    for (let i = 0; i < Math.ceil(all_symbols.length / chunkSize); i++) {
        let symbols_chunk  = [];
        for(let j = i * chunkSize; j < (i + 1) * chunkSize && j < all_symbols.length; j++){
            symbols_chunk.push(all_symbols[j]);
        }

        tasks.push({
            url: ws_url,
            params: createParams(symbols_chunk, exchange),
            method: method,
            exchange: exchange
        });
        console.log('Task ', i , " ", tasks[i], ' exchange: ', exchange)
    }

    for (let i = 0; i < tasks.length; i++) {
        const worker = createWorker(i, worker_path);
        workers.push(worker);
        // console.log("Tasks size: ", tasks.length);
        worker.postMessage(tasks[i]);
    }
}

function updateCoinInfo(symbol, newPrice, newVolume) {
    const pureSymbol = symbol.slice(0, -4).toLowerCase();

    const coinItems = Array.from(document.querySelectorAll('.coin_item_wrapper'));
    let coinItem = coinItems.find(item => {
         const coinData = item.querySelector('.coin_item');
         return coinData && coinData.getAttribute('data-symbol').trim() === pureSymbol;
    });

    if (coinItem) {
            coinItem.querySelector('.coin.price').textContent = newPrice;
    } else {
        console.warn("Coin item not found for symbol: ", pureSymbol);
    }
    coinItem = coinItems.find(item => {
         const coinData = item.querySelector('.coin_item');
         return coinData && coinData.getAttribute('data-symbol').trim() === pureSymbol;
    });
    if (coinItem) {
            coinItem.querySelector('.coin.volume').textContent = newVolume;
    } else {
        console.log("Coin item not found for symbol: ", pureSymbol);
    }
}
