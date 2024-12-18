let chart = null;
let interval = '4h';
let barData = [];
let symbol;
let exchange = "MEXC";


const getHistoricalPrice = async () => {
    console.log("getHistoricalPrice");
    const urlParts = window.location.href.split('/');
    symbol = urlParts[urlParts.length - 2];


    const url = `/coin/api/historical_price?symbol=${symbol.toUpperCase()}USDT&interval=${interval}`;
    console.log("Symbol: ", symbol);

    try {
        const response = await fetch(url);
        const rdata = await response.json();

        for (let i = 0; i < rdata.length; i++) {
            barData.push({
                x: rdata[i][0],
                o: rdata[i][1],
                h: rdata[i][2],
                l: rdata[i][3],
                c: rdata[i][4]
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error); // Обробка помилок
    }
}

let context = document.getElementById('chart').getContext('2d');
context.canvas.width = 1000;
context.canvas.height = 250;

const createChart = (data) => {
    if (chart) {
        chart.destroy();
    }
    console.log("creating chart")
    const minX = Math.min(...data.map(d => d.x)); // Мінімальне значення осі X
    const maxX = Math.max(...data.map(d => d.x)); // Максимальне значення осі X


    let xScaleConfig = {

        ticks: {
            autoSkip: true,
        },
        type: 'time',
        time: {
            unit: 'day',
        },
    }

    let yScaleConfig = {}
    let zoomOptions = {
        limits: {
            x: {
                min: minX,
                max: maxX,
            }
        },
        pan: {
            enabled: true,
            mode: 'x',
        },
        zoom: {
            mode: 'x',
            pinch: {
                enabled: true,
            },
            wheel: {
                enabled: true
            }
        }
    }

    let config = {
        type: 'candlestick',
        data: {
            datasets: [{
                label: `${symbol.toUpperCase()}/USDT`,
                data: barData,
            }
                // , {
                //   label: 'Close price',
                //   type: 'line',
                //   data: lineData,
                //   hidden: true,
                // }
            ]
        },
        options: {
            scales: {
                x: xScaleConfig,
                y: yScaleConfig
            },
            plugins: {
                zoom: zoomOptions,
                tooltip: {
                    enabled: true,
                    intersect: true, // Показувати підказки, навіть якщо курсор не перетинає елемент
                    mode: 'nearest', // Вибрати найближчу область
                    callbacks: {
                        label: function (context) {
                            let ohlc = context.raw; // Доступ до свічкових даних
                            return `O: ${ohlc.o}, H: ${ohlc.h}, L: ${ohlc.l}, C: ${ohlc.c}`;
                        }
                    }
                }
            },

        }
    }
    chart = new Chart(context, config)
}

(async () => {
    await getHistoricalPrice();
    console.log(barData);
    createChart(barData);
})();

document.getElementById('radio-form').addEventListener('change', function (event) {

    if (event.target.name === 'radioChart') {
        interval = event.target.value;
        barData = [];

        (async () => {
            await getHistoricalPrice();
            console.log(barData);
            createChart(barData);
        })();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const defaultRadioId = "radio4h";
    const defaultRadio = document.getElementById(defaultRadioId);

    if (defaultRadio) {
        defaultRadio.checked = true;
    }
});

// form edit/delete
const modalEditDelete = document.getElementById('customCoinModal')
const closeModalBtn = document.getElementById('closeModalBtn')
const editCustomCoinBtn = document.getElementById('editCustomCoinBtn')
const editDefaultCoinBtn = document.getElementById('editDefaultCoinBtn')

if (editCustomCoinBtn != null) {
    editCustomCoinBtn.addEventListener('click', () => {
        modalEditDelete.style.display = 'flex';
    });
}

if (editDefaultCoinBtn != null) {
    editDefaultCoinBtn.addEventListener('click', () => {
        modalEditDelete.style.display = 'flex';
    });
}

closeModalBtn.addEventListener('click', () => {
    modalEditDelete.style.display = 'none';
});

modalEditDelete.addEventListener('click', (e) => {
    if (e.target === modalEditDelete) {
        modalEditDelete.style.display = 'none';
    }
});

// update coin
document.getElementById('applyChanges').addEventListener('click', function (event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('customCoinForm'));

    fetch(`/coin/update-coin/`, {
        method: "POST",
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const statusMessage = document.getElementById('statusMessage');
            console.log("Response from server:", data);

            if (data.success) {
                statusMessage.textContent = 'Coin updated successfully!';
                statusMessage.style.color = 'green';
                if (data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = data.redirect_url;
                    }, 1500);
                }
            } else {
                statusMessage.textContent = 'Error updating coin.';
                statusMessage.style.color = 'red';
                alert(data.message);
            }
            statusMessage.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// delete coin
document.getElementById('deleteCoin').addEventListener('click', function () {
    event.preventDefault(); // Забороняємо стандартну поведінку форми

    const formData = new FormData(document.getElementById('customCoinForm'));

    fetch("/coin/delete-coin/", {
        method: "POST",
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const statusMessage = document.getElementById('statusMessage');
            if (data.success) {
                statusMessage.textContent = 'Coin deleted successfully!';
                statusMessage.style.color = 'green';
                window.location.href = data.redirect_url;
            } else {
                statusMessage.textContent = 'Error deleting coin.';
                statusMessage.style.color = 'red';
                alert(data.message);
            }
            statusMessage.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


// live
const MAX_POINTS = 50;
const canvas1 = document.getElementById('chart_1');
const canvas2 = document.getElementById('chart_2');

if (!canvas1 || !canvas2) {
    console.error('Canvas elements not found!');
}

const context1 = canvas1.getContext('2d');
const context2 = canvas2.getContext('2d');

// charts
let chart1 = null;
let chart2 = null;


// const createLineChart = (context, data, label) => {
//     return new Chart(context, {
//         type: 'line',
//         data: {
//             labels: data.map(d => d.time), // Масив часу як строки ISO
//             datasets: [{
//                 label: label,
//                 data: data.map(d => d.price),
//                 borderColor: 'rgba(255, 99, 132, 1)',
//                 borderWidth: 2,
//                 pointRadius: 3, // Показ точок на графіку
//                 fill: false,
//             }]
//         },
//         options: {
//             animation: false,
//             scales: {
//                 x: {
//                     type: 'time',
//                     time: {
//                         unit: 'second', // Встановлення дрібнішого інтервалу часу
//                         tooltipFormat: 'MMM dd, yyyy HH:mm:ss',
//                         displayFormats: {
//                             second: 'HH:mm:ss',
//                             minute: 'HH:mm',
//                             hour: 'MMM dd HH:mm',
//                         },
//                     },
//                     ticks: {
//                         autoSkip: false, // Показати всі мітки
//                         maxRotation: 0, // Горизонтальні мітки
//                         font: { size: 10 },
//                         callback: function(value, index, values) {
//                             return new Date(value).toLocaleTimeString([], {
//                                 hour: '2-digit',
//                                 minute: '2-digit',
//                                 second: '2-digit'
//                             });
//                         }
//                     },
//                     grid: {
//                         color: 'rgba(255, 255, 255, 0.1)',
//                     }
//                 },
//                 y: {
//                     beginAtZero: false,
//                     ticks: {
//                         font: { size: 12 }
//                     },
//                     grid: {
//                         color: 'rgba(255, 255, 255, 0.1)',
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: true,
//                     labels: {
//                         color: '#ffffff',
//                         font: {
//                             size: 14
//                         }
//                     }
//                 },
//                 tooltip: {
//                     enabled: true,
//                     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//                     titleColor: '#ffffff',
//                     bodyColor: '#ffffff',
//                     bodyFont: {
//                         size: 12
//                     }
//                 }
//             }
//         }
//     });
// };


const createLineChart = (context, data, label) => {
    return new Chart(context, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.time).toISOString()), // ISO час
            datasets: [{
                label: label,
                data: data.map(d => d.price),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointRadius: 3, // Розмір точок
                pointHoverRadius: 5, // Збільшити точку при наведенні
                fill: false,
            }]
        },
        options: {
            animation: false,
            interaction: {
                mode: 'point',
                intersect: true
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        title: function(context) {
                            const time = new Date(context[0].parsed.x);
                            return `Time: ${time.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}`;
                        },
                        label: function(context) {
                            return `Price: ${context.parsed.y} USDT`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'mm:ss',
                        }
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 0,
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
};

const updateChart = (chart, data) => {
    if (!data || !data.time || !data.price) {
        console.warn('Invalid data received for updateChart:', data);
        return;
    }

    chart.data.labels.push(new Date(data.time));
    chart.data.datasets[0].data.push(data.price);
    console.warn("xLabels: ", data.time)
    const maxVisiblePoints = 10;

    // Видаляємо старі дані
    if (chart.data.labels.length > maxVisiblePoints) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    // Налаштовуємо межі для `x`
    const minTime = new Date(chart.data.labels[0]);
    const maxTime = new Date(chart.data.labels[chart.data.labels.length - 1]);

    chart.options.scales.x.min = minTime;
    chart.options.scales.x.max = maxTime;

    chart.update();
};



const xData = [ ];
const yData = [ ];

const xStartData = xData.slice(0, 6);
const yStartData = yData.slice(0, 6);

const xParseData = xData.slice(6);
const yParseData = yData.slice(6);

//
// const worker_path_ = `/static/deps/js/worker_2.js`;
// let workers = [];
// let tasks = [];
// let data = [];
//
// const exchangesToCompare = [
//     {
//         exchange_name: 'MEXC',
//         ws_url: 'wss://wbs.mexc.com/ws',
//         method: 'SUBSCRIPTION',
//         params: "spot@public.deals.v3.api@" + symbol.toUpperCase() + `USDT`,
//         context: context1,
//         chart: () => chart1
//     },
//     {
//         exchange_name: 'Binance',
//         ws_url: 'wss://stream.binance.com:9443/ws',
//         method: 'SUBSCRIBE',
//         params: symbol.toLowerCase() + "usdt@trade",
//         context: context2,
//         chart: () => chart2
//     }
// ];
//
// function start() {
//     const tasks = [];
//      exchangesToCompare.forEach((exchange, index) => {
//         tasks.push({
//             url: exchange.ws_url,
//             method: exchange.method,
//             params: [exchange.params],
//         });
//     });
//     console.log("tasks: ", tasks);
//     for(let i = 0; i < tasks.length; i++){
//         const worker = createWorker(worker_path_, exchangesToCompare[i]);
//         workers.push(worker);
//         worker.postMessage(tasks[i]);
//     }
// }
//
// const createWorker = (workerPath, exchange) => {
//     const worker = new Worker(workerPath);
//
//     worker.onmessage = (e) => {
//         const parsedData = parseData(e.data);
//         if (parsedData) {
//             console.log("worker.onmessage parsedData: ", parsedData);
//
//             updateChart(exchange.chart(), parsedData);
//         }
//     };
//
//     worker.onerror = (err) => {
//         console.error('Worker error:', err);
//     };
//
//     return worker;
// };
//
// const createWorkers = (symbol) => {
//     exchangesToCompare.forEach((exchange) => {
//         const worker = createWorker('/static/deps/js/worker_2.js', exchange, symbol);
//         workers.push(worker); // Додаємо воркер до списку
//     });
// };
//
// const parseData = (data) => {
//     try {
//         if (data.d) { // MEXC
//             return {
//                 price: parseFloat(data.d.deals[0]?.p || 0),
//                 time: new Date(data.d.deals[0]?.t || Date.now()).toISOString(),
//                 exchange: "MEXC"
//             };
//         } else if (data.e) { // Binance
//             return {
//                 price: parseFloat(data.p || 0),
//                 time: new Date(data.T || Date.now()).toISOString(),
//                 exchange: "Binance"
//             };
//         } else {
//             console.warn('Unknown data format:', data);
//             return null;
//         }
//     } catch (err) {
//         console.error('Error parsing data:', err);
//         return null;
//     }
// };
//
// (async () => {
//     const symbol = 'BTC';
//     const historicalData = [];
//
//     chart1 = createLineChart(context1, historicalData, `${symbol}/USDT - MEXC`);
//     chart2 = createLineChart(context2, historicalData, `${symbol}/USDT - Binance`);
//     start();
//
// })();
const worker_path_ = `/static/deps/js/worker_2.js`;
let workers = [];
let tasks = [];
let bufferedData = { MEXC: [], Binance: [] };
const trades_interval = 3000;
const period_spans = document.getElementsByClassName('period-recent-trades');
for (let span of period_spans) {
    span.innerHTML = trades_interval / 1000;
}

const exchangesToCompare = [
    {
        exchange_name: 'MEXC',
        ws_url: 'wss://wbs.mexc.com/ws',
        method: 'SUBSCRIPTION',
        params: "spot@public.deals.v3.api@" + symbol.toUpperCase() + `USDT`,
        context: context1,
        chart: () => chart1
    },
    {
        exchange_name: 'Binance',
        ws_url: 'wss://stream.binance.com:9443/ws',
        method: 'SUBSCRIBE',
        params: symbol.toLowerCase() + "usdt@trade",
        context: context2,
        chart: () => chart2
    }
];

const calculateAverage = (data) => {
    const sum = data.reduce((acc, item) => acc + item.price, 0);
    return data.length ? sum / data.length : 0;
};

const totalVol = (data) => {
    let result = 0;
    for(let i = 0; i < data.length; i++) {
        result += data[i].volume;
    }
    return result;
};

const startAveraging = (exchange) => {
    setInterval(() => {
        const data = bufferedData[exchange.exchange_name];
        console.log("summarize data: ", data);
        if (data.length > 0) {
            const averagePrice = calculateAverage(data);
            const totalVolume = totalVol(data);
            const trades = data.length;
            const averageTime = new Date();

            updateChart(exchange.chart(), { price: averagePrice, time: averageTime });
            console.log(`${exchange.exchange_name} Average Price:`, averagePrice);

            // updateTable(averageTime, averagePrice, totalVolume, trades);
            updateTable(exchange.exchange_name, averageTime, averagePrice, totalVolume, trades);
            bufferedData[exchange.exchange_name] = [];
        }
    }, trades_interval);
};

function start() {
    exchangesToCompare.forEach((exchange) => {
        const task = {
            url: exchange.ws_url,
            method: exchange.method,
            params: [exchange.params],
        };

        const worker = createWorker(worker_path_, exchange);
        workers.push(worker);
        worker.postMessage(task);

        startAveraging(exchange);
    });
}


const createWorker = (workerPath, exchange) => {
    const worker = new Worker(workerPath);

    worker.onmessage = (e) => {
        const parsedData = parseData(e.data);
        if (parsedData) {
            bufferedData[exchange.exchange_name].push(parsedData);
            // console.log(`Buffered data for ${exchange.exchange_name}:`, parsedData);


            // updateChart(exchange.chart(), parsedData);
        }
    };

    worker.onerror = (err) => {
        console.error('Worker error:', err);
    };

    return worker;
};


const parseData = (data) => {
    try {
        if (data.d) { // MEXC
            return {
                price: parseFloat(data.d.deals[0]?.p || 0),
                volume: parseFloat(data.d.deals[0]?.p || 0),
                time: new Date(data.d.deals[0]?.t || Date.now()).toISOString(),
                exchange: "MEXC"
            };
        } else if (data.e) { // Binance
            return {
                price: parseFloat(data.p || 0),
                time: new Date(data.T || Date.now()).toISOString(),
                volume: parseFloat(data.q || 0),
                exchange: "Binance"
            };
        } else {
            console.warn('Unknown data format:', data);
            return null;
        }
    } catch (err) {
        console.error('Error parsing data:', err);
        return null;
    }
};

(async () => {
    const symbol = 'BTC';
    const historicalData = [];

    chart1 = createLineChart(context1, historicalData, `${symbol}/USDT - MEXC`);
    chart2 = createLineChart(context2, historicalData, `${symbol}/USDT - Binance`);
    start();
})();


// logs
const tableBody = document.querySelector('.trades-table tbody');
const maxRows = 5; // Максимальна кількість рядків у таблиці

function updateTable(exchangeName, time, avgPrice, totalVolume, trades) {
    const tableBody = document.querySelector(`#table-${exchangeName.toLowerCase()} tbody`);
    const maxRows = 5;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${time}</td>
        <td>${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
        <td>${trades}</td>
    `;

    tableBody.insertBefore(newRow, tableBody.firstChild);

    while (tableBody.rows.length > maxRows) {
        tableBody.deleteRow(-1);
    }
}



