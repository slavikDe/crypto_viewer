let chart = null;
let interval = '4h';
let barData = [];
let lineData = null;
let symbol;

const getHistoricalPrice = async () => {

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
  }catch (error) {
    console.error('Error fetching data:', error); // Обробка помилок
  }
}

let context = document.getElementById('chart').getContext('2d');
context.canvas.width = 1000;
context.canvas.height = 250;


(async () => {
  await getHistoricalPrice();
  console.log(barData);
  createChart(barData);
})();

const createChart = (data) => {
  if (chart){
    chart.destroy();
  }

  const minX = Math.min(...data.map(d => d.x)); // Мінімальне значення осі X
  const maxX = Math.max(...data.map(d => d.x)); // Максимальне значення осі X



  let xScaleConfig = {

    ticks: {
      autoSkip: true,

    },
    type: 'time',
    time : {
      unit: 'day',
    },
  }

  let yScaleConfig = {  }
  let zoomOptions = {
    limits: {
      x : {
        min: minX,
        max: maxX,
      }
    },
    pan :{
      enabled: true,
      mode: 'x',
    },
    zoom:{
      mode: 'x',
      pinch: {
        enabled: true,
      },
      wheel:{
        enabled: true
      }
    }
  }

  let config= {
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
            label: function(context) {
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

document.getElementById('radio-form').addEventListener('change', function(event) {

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

document.addEventListener("DOMContentLoaded", function() {
        const defaultRadioId = "radio4h";
        const defaultRadio = document.getElementById(defaultRadioId);

        if (defaultRadio) {
            defaultRadio.checked = true;
        }
    });