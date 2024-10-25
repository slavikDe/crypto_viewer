const chatSocket = new WebSocket('wss://wbs.mexc.com/ws');

const symbol = 'BTCUSDT'

chatSocket.onopen = function() {
    // Subscribe to the BTCUSDT deals API channel when the connection opens
    chatSocket.send(JSON.stringify({
        "method": "SUBSCRIPTION",
        "params": ["spot@public.deals.v3.api@"+symbol]
    }));
};

// Функція для оновлення ціни в HTML
function setPrice(price) {
    // Отримуємо всі елементи з класом "coin price"
    const div_price = document.getElementsByClassName("coin price");

    // Перевіряємо, чи знайдено елементи
    if (div_price.length > 0) {
        // Оновлюємо текстовий вміст першого елемента
        div_price[0].textContent =  "$" + price ; // Використовуємо 0, щоб звернутись до першого елемента
    } else {
        console.warn("Element with class 'coin price' not found.");
    }
}

chatSocket.onmessage = function(event) {
    try {
        const data = JSON.parse(event.data);

        if (data.d && data.d.deals && data.d.deals.length > 0) {
            const price = data.d.deals[0].p;
            setPrice(price);
        } else {
            console.warn("Deals array is empty or missing.");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded. WebSocket is ready to receive messages.");
});


// chatSocket.onmessage = function(event) {
//     try {
//         const data = JSON.parse(event.data);
//
//         if (data.d && data.d.deals && data.d.deals.length > 0) {
//             const price = data.d.deals[0].p;
//             // console.log('Received price:', price);
//             setPrice(price);
//         } else {
//             console.warn("Deals array is empty or missing.");
//         }
//     } catch (error) {
//         console.error("Error parsing JSON:", error);
//     }
// };
//
//
// document.addEventListener("DOMContentLoaded", function() {
// const div_price = document.getElementsByClassName("coin price");
// if (div_price) {
//
//     div_price.textContent = JSON.stringify(price);
// }
// });

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

// Function to send a message
function sendMessage(message) {
    chatSocket.send(JSON.stringify({
        'message': message
    }));
}
