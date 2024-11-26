const worker_path = `/static/deps/js/worker_2.js`;

const market_url = 'wss://wbs.mexc.com/ws';
const MEXC_base_url = 'https://api.mexc.com';
const method = 'SUBSCRIPTION';
const workers = []

// const all_symbols = Array.from(document.getElementsByClassName('coin_symbol'));
let all_symbols = []; // from server
// get symbols from api

fetch('/coins/api/coins/')
    .then(response => response.json())
    .then(data => {
        console.log("fetching api")
        all_symbols = data.coins;
        start(); // create params & open sockets
    })
    .catch(error => console.error("Error fetching coins: ", error));



let results = []
function createWorker(workerId) {
    const worker = new Worker(worker_path);

    worker.onmessage = (event) => {
        results[workerId] = event.data;
        // console.log(`Get data from worker-${workerId}, data : ${event.data}`, ", SYMBOL: ", event.data.symbol);

        if(event.data) {
            console.log(`event data ${event.data.symbol}` , event.data.price)
            updateCoinInfo(event.data.symbol, event.data.price, event.data.volume);

        }
    }

    worker.onmessageerror = (error) => {
        console.error(`Error in worker-${workerId}: `, error.data);
    }
    return worker;
}

function createParams(coins_symbols){
    const results = [];
    for (let i = 0; i < coins_symbols.length; i++) {
        results.push(`spot@public.deals.v3.api@${coins_symbols[i].toUpperCase()}USDT`)
    }
    // console.log("params: ", results);
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
            url: market_url,
            method: method,
            params: createParams(symbols_chunk)
        });
        // console.log('Task ', i , " ", tasks[i])
    }

    for (let i = 0; i < tasks.length; i++) {
        const worker = createWorker(i);
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
        console.log("Coin item not found for symbol: ", pureSymbol);
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
