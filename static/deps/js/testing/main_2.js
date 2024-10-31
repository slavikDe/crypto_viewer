const worker_path = `/static/deps/js/testing/worker_2.js`;

const market_url = 'wss://wbs.mexc.com/ws';
const method = 'SUBSCRIPTION';
const workers = []
const all_symbols = document.getElementsByClassName('coin_symbol');
results = []

function createWorker(workerId) {
    const worker = new Worker(worker_path);

    worker.onmessage = (event) => {
        results[workerId] = event.data;
        console.log(`Get data from worker-${workerId}, data : ${event.data}`, ", SYMBOL: ", symbol);

        if(event.data) {
            console.log(`event data ${symbol}` , event.data.price)
            updateCoinInfo(event.data.symbol, event.data.price)
        }
    }

    worker.onmessageerror = (error) => {
        console.error(`Error in worker-${workerId}: `, error.data);
    }
    return worker;
}

// const task = {market_url, method, params};
const tasks = [];
for (let i = 0; i < all_symbols.length; i++) {
    symbol = all_symbols[i].textContent;
    console.log("Symbol: ",symbol);
    console.log("Typeof symbol: ",typeof symbol);

    tasks[i] = { market_url, method, params: [`spot@public.deals.v3.api@${symbol}USDT`] };
}

for (let i = 0; i < all_symbols.length; i++) {
    const worker = createWorker(i);
    workers.push(worker);
    worker.postMessage(tasks[i]);
}


function updateCoinInfo(symbol, newPrice) {
    console.log("updateCoinPrice: ",  (symbol + 'USDT'), " ", newPrice);

    const coinItems = Array.from(document.querySelectorAll('.coin_item_wrapper'));
    const coinItem = coinItems.find(item =>
        {
         const coinData = item.querySelector('.coin_item');
         return coinData && coinData.getAttribute('data-symbol').trim() === symbol;
        });

    console.log("coinItem ", coinItem);
    if (coinItem) {
            coinItem.querySelector('.coin.price').textContent = newPrice;
    }
}


let isDescending = true;

    function toggleSortOrder() {
        const orderBy = isDescending ? 'price' : '-price';

        sortAndSetURL(orderBy);

        const button = document.querySelector("button[onclick='toggleSortOrder()']");
        // button.textContent = isDescending ? "Sort by Price (Asc)" : "Sort by Price (Desc)";

        isDescending = !isDescending;
    }

function sortAndSetURL(orderBy) {
        sortCoinsByPrice(orderBy);

        // adding to url (order_by_price=price/-price)
        // const currentUrl = new URL(window.location.href);
        // currentUrl.searchParams.set('order_by_price', orderBy);
        // history.pushState(null, '', currentUrl.toString());
}

function sortCoinsByPrice(orderBy) {
    const container = document.querySelector('.coin_wrapper');
    const coinItems = Array.from(document.querySelectorAll('.coin_item_wrapper'));

    const isDescending = orderBy === 'price';

    coinItems.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.coin.price').textContent);
        const priceB = parseFloat(b.querySelector('.coin.price').textContent);

        const isANumber = !isNaN(priceA);
        const isBNumber = !isNaN(priceB);

        if (isANumber && isBNumber) {
            return isDescending ? priceB - priceA : priceA - priceB;
        }
        if (isANumber) return -1;
        if (isBNumber) return 1;

        return 0;
    });

    coinItems.forEach(item => container.appendChild(item));
}


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderBy = urlParams.get('order_by_price');

    if (orderBy) {
        sortCoinsByPrice(orderBy);
    }
});