function renderOrderBook(exchange, data) {
    const sellersList = document.getElementById(`${exchange}-sellers`);
    const buyersList = document.getElementById(`${exchange}-buyers`);

    const maxSellerVolume = Math.max(...data.sellers.map(item => parseFloat(item.amount)));
    const maxBuyerVolume = Math.max(...data.buyers.map(item => parseFloat(item.amount)));

    // Максимальний розмір бару 80%
    const maxBarWidth = 80;

    sellersList.innerHTML = data.sellers
        .map(item => {
            const volumePercent = (parseFloat(item.amount) / maxSellerVolume) * maxBarWidth;
            return `
                <li class="order-item">
                    <span class="price">${item.price}</span>
                    <span class="amount">${item.amount}</span>
                    <div class="volume-bar-container">
                        <div class="volume-bar" style="width: ${volumePercent}%;"></div>
                    </div>
                </li>
            `;
        })
        .join("");

    buyersList.innerHTML = data.buyers
        .map(item => {
            const volumePercent = (parseFloat(item.amount) / maxBuyerVolume) * maxBarWidth;
            return `
                <li class="order-item">
                    <span class="price">${item.price}</span>
                    <span class="amount">${item.amount}</span>
                    <div class="volume-bar-container">
                        <div class="volume-bar" style="width: ${volumePercent}%;"></div>
                    </div>
                </li>
            `;
        })
        .join("");
}


const exampleData = {
exchange1: {
    sellers: [
        { price: "100.50", amount: "1.2" },
        { price: "100.40", amount: "2.8" },
        { price: "100.30", amount: "1.5" },
        { price: "100.20", amount: "3.0" },
    ],
    buyers: [
        { price: "99.50", amount: "1.8" },
        { price: "99.40", amount: "4.3" },
        { price: "99.30", amount: "2.0" },
        { price: "99.20", amount: "1.7" },
    ],
},
exchange2: {
    sellers: [
        { price: "200.50", amount: "0.6" },
        { price: "200.40", amount: "1.3" },
        { price: "200.30", amount: "1.1" },
        { price: "200.20", amount: "0.9" },
    ],
    buyers: [
        { price: "199.50", amount: "2.1" },
        { price: "199.40", amount: "1.5" },
        { price: "199.30", amount: "1.8" },
        { price: "199.20", amount: "0.6" },
    ],
},
};

renderOrderBook("exchange1", exampleData.exchange1);
// renderOrderBook("exchange2", exampleData.exchange2);

// create worker and open
const worker_path_ = `/static/deps/js/worker_2.js`;

const MEXC_market_url = 'wss://wbs.mexc.com/ws';
const MEXC_base_url = 'https://api.mexc.com';
const method = 'SUBSCRIPTION';
const MEXC_endpoint = 'spot@public.increase.depth.v3.api@';
const workers = []
const coinSymbolElement = document.getElementById('coin-name')
const INTERVAL = 500;

let data = [];
let buyers = [];
let sellers = [];

start();


function createWorker(worker_path) {
    const worker = new Worker(worker_path);
    console.log("worker path: ", worker_path)
    worker.onmessage = (e) => {
        if (e.data) {
            data.push(e.data);
        }
    }
    worker.onmessageerror = (error) => {
        console.error("Worker error: ", error.data)
    }

    return worker;
}
function start() {
    let task = [];
    task.push({
        url : MEXC_market_url,
        method : method,
        params: [MEXC_endpoint + coinSymbolElement.textContent.toUpperCase()+'USDT']
    })

    console.log('task: ', task)
    const worker = createWorker(worker_path_);
    workers.push(worker)
    worker.postMessage(task[0]);

    dataCollecting(INTERVAL);
}

function dataCollecting(duration= 1500) {
    console.log(`Starting data collection for ${duration / 1000} seconds...`);

    setInterval(() => {
        if (data.length > 0) {
            console.log("Data collection complete. Processing data...");
            processData(data);
            data = [];
        }else {
            console.log("No data received in this interval.");
        }

    }, duration);
}

function processData(data) {
    for (let log of data) {
        if (log.d && log.d.asks) {
            log.d.asks.forEach(order => {
                if (parseFloat(order.v) > 0) {
                    updateLevel(sellers, order.p, order.v);
                }
            });
        }
        if (log.d && log.d.bids) {
            log.d.bids.forEach(order => {
                if (parseFloat(order.v) > 0) {
                    updateLevel(buyers, order.p, order.v);
                }
            });
        }
    }

    // Видаляємо рівні з нульовим обсягом
    sellers = sellers.filter(order => parseFloat(order.volume) > 0);
    buyers = buyers.filter(order => parseFloat(order.volume) > 0);

    // Сортуємо та беремо топові рівні
    const topSellers = sellers.sort((a, b) => a.price - b.price).slice(0, 5);
    const topBuyers = buyers.sort((a, b) => b.price - a.price).slice(0, 5);

    updateOrderBook({ topSellers, topBuyers });
}


function updateOrderBook(data) {
    const { topSellers, topBuyers } = data;
    console.log("topBuyers: ", topBuyers);
    // Перетворення даних до формату, який очікує renderOrderBook
    const sellersFormatted = topSellers.map(order => ({
        price: order.price,
        amount: order.volume
    }));

    const buyersFormatted = topBuyers.map(order => ({
        price: order.price,
        amount: order.volume
    }));
    console.log("sellersFormated: ", sellersFormatted)
    console.log("buyersFormatted: ", buyersFormatted)
    // Оновлення DOM через renderOrderBook
    renderOrderBook("exchange1", {
        sellers: sellersFormatted,
        buyers: buyersFormatted
    });
}

function updateLevel(orderArray, price, volume) {
    const priceFloat = parseFloat(price);
    const volumeFloat = parseFloat(volume);

    const index = orderArray.findIndex(order => parseFloat(order.price) === priceFloat);

    if (volumeFloat === 0) {
        if (index !== -1) {
            orderArray.splice(index, 1);
        }
    } else {
        if (index !== -1) {
            orderArray[index].volume = volumeFloat;
        } else {
            orderArray.push({ price: priceFloat, volume: volumeFloat });
        }
    }
}
