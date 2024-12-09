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

            // lineData = barData.map(item => ({
            //    x: item.x,
            //    y: item.c
            //  }));
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

if (editCustomCoinBtn != null){
    editCustomCoinBtn.addEventListener('click', () => {
        modalEditDelete.style.display = 'flex';
    });
}

if (editDefaultCoinBtn != null){
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
document.getElementById('applyChanges').addEventListener('click', function(event) {
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
document.getElementById('deleteCoin').addEventListener('click', function() {
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
                window.location.href= data.redirect_url;
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