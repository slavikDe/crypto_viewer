const workers = [];
const numWorkers = 4; // Кількість Web Workers
const tasks = [1, 2, 3, 4, 5, 6, 7, 8]; // Завдання для виконання
let results = [];
const worker_path = `/static/deps/js/jsForHomePage/worker.js`;

// Функція для створення робітників
function createWorker(workerId) {
    const worker = new Worker(worker_path);

    worker.onmessage = function(event) {
        results[workerId] = event.data;
        console.log(`Робітник ${workerId} завершив:`, event.data);

        // Перевірка, чи всі робітники завершили
        if (results.length === numWorkers) {
            console.log('Усі задачі виконані:', results);
        }
    };

    worker.onerror = function(error) {
        console.error(`Помилка в робітнику ${workerId}:`, error);
    };

    return worker;
}

// Створення та запуск Web Workers
for (let i = 0; i < numWorkers; i++) {
    const worker = createWorker(i);
    workers.push(worker);
    worker.postMessage(tasks[i]); // Надсилаємо завдання до робітника
}
