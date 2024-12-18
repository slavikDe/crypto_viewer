const openModalButton = document.getElementById('openModalBtn');
const openModalButtonAdmin = document.getElementById('openModalBtnAdmin');
const closeModalButton = document.getElementById('closeModalBtn');
const modal = document.getElementById('customCoinModal');
const testButton = document.getElementById('testButton');
const addButton = document.getElementById('addButton');
const statusMessage = document.getElementById('statusMessage');
let isAdminUser = false;

console.log("testButton:", testButton);
console.log("addButton:", addButton) ;

if(openModalButton){
    openModalButton.addEventListener('click', function () {
        modal.style.display = 'block';
    });
}

if(openModalButtonAdmin){
    openModalButtonAdmin.addEventListener('click', function () {
        modal.style.display = 'block';
        isAdminUser = true;
    });
}

closeModalButton.addEventListener('click', function () {
    modal.style.display = 'none';
    isAdminUser = false;
    resetForm();
    console.log("closeModalButton")
});

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        resetForm();
    }
    console.log("window close")
});

testButton.addEventListener('click', function () {
    console.log("testButton click")
    console.log('isSuperUser: ', isAdminUser)
    const market = document.getElementById('exchange-selector').value;

    const symbol = document.getElementById('symbol').value.trim() + 'USDT';
    const name = document.getElementById('coin-name').value;

    if (!market || !symbol) {
        showStatusMessage('Please select market and fill symbol field.', 'red');
        return;
    }

    fetch('/coins/test-coin/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ market, symbol, name }),
    })
        .then(response => {

            if (response.status === 200) {
                return response.json();
            } else {
                return response.json().then(err => { throw new Error(err.error); });
            }
        })
        .then(data => {
            showStatusMessage('Symbol is valid. You can add it.', 'green');
            addButton.disabled = false;
            addButton.dataset.market = market;
            addButton.dataset.symbol = symbol;
            addButton.dataset.name = name;
        })
        .catch(error => {
            showStatusMessage('Error: ' + error.message, 'red');
            addButton.disabled = true;
        });
});

addButton.addEventListener('click', function () {
    console.log("addbutton")

    const market = addButton.dataset.market;
    const symbol = addButton.dataset.symbol;
    const name = addButton.dataset.name;
    console.log("market: ", market)
    if (!market || !symbol) {
        showStatusMessage('Invalid data. Please test again.', 'red');
        return;
    }

    let endpoint = null;
    if (isAdminUser)  endpoint = '/coins/add-default-coin/';
    else endpoint = '/coins/add-custom-coin/';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ market, symbol, name }),
    })
        .then(response => {
            if (response.status === 201) {
                return response.json();
            } else {
                return response.json().then(err => { throw new Error(err.error); });
            }
        })
        .then(data => {
            showStatusMessage('Coin added successfully!', 'green');
            setTimeout(() => {
                location.reload();
            }, 1000);
        })
        .catch(error => {
            showStatusMessage('Error adding coin: ' + error.message, 'red');
        });
});

function showStatusMessage(message, color) {
    statusMessage.style.display = 'block';
    statusMessage.style.color = color;
    statusMessage.textContent = message;
}

function resetForm() {
    document.getElementById('coin-market').value = '';
    document.getElementById('symbol').value = '';
    document.getElementById('coin-name').value = '';
    addButton.disabled = true;
    statusMessage.style.display = 'none';
    console.log("reset")

}

// CSRF-token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
