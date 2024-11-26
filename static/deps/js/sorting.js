

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