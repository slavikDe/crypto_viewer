
//
//
// const worker = new Worker('dataWorker.js');
//
// //  listen to messages from the worker with new data
// worker.addEventListener('message', (event) => {
//   const updatedData = event.data;
//   updatePageWithNewData(updatedData); // func for update DOM
// });
//
// // func for update DOM with new data
// function updatePageWithNewData(data) {
//   const displayElement = document.getElementById('liveData'); // our html teg of coin in coinList
//   displayElement.textContent = `Ціна: ${data.price}, Обсяг: ${data.volume}`;// test
// }

class SocketConn {
  constructor(url, method, params) {
    this.url = url;
    this.method = method;
    this.params = params || [];

    // Ініціалізація WebSocket-з'єднання
    this.socket = new WebSocket(this.url);

    // Встановлення обробників подій
    this.socket.addEventListener('open', () => this.onOpen());
    this.socket.addEventListener('message', (event) => this.onMessage(event));
    this.socket.addEventListener('error', (error) => this.onError(error));
    this.socket.addEventListener('close', () => this.onClose());
  }

  // Метод, що виконується при відкритті з'єднання
  onOpen() {
    console.log('WebSocket opened', this.params);

    // Формуємо та відправляємо запит
    const tradeStr = JSON.stringify({
      method: this.method,
      params: this.params
    });

    this.socket.send(tradeStr);
  }

  // Метод для обробки повідомлень від сервера
  onMessage(event) {
    const data = JSON.parse(event.data);

    // Валідуємо отримані дані
    const processedData = {
      price: data.price,
      volume: data.volume
    };

    // Відправляємо оброблені дані до основного потоку (при використанні Web Worker)
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage(processedData);
    } else {
      console.log('Received data:', processedData); // Для перевірки даних без Web Worker
    }
  }

  // Метод для обробки помилок
  onError(error) {
    console.error('WebSocket Error', error);
  }

  // Метод для закриття з'єднання
  onClose() {
    console.log('WebSocket closed');
  }
}

// Використання класу
const url = 'wss://wbs.mexc.com/ws';
const symbol = 'BTCUSDT';
const method = 'SUBSCRIPTION';
const params = [method, [`spot@public.deals.v3.api@${symbol}`]];

// Створення WebSocket-з'єднання
const socketConn = new SocketConn(url, method, params);
