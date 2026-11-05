const currencyList = document.getElementById("currencyList");
const updateDate = document.getElementById("updateDate");

const modal = document.getElementById("modal");

let currencies = [];

function formatPrice(value) {
    return value.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    });
}

async function loadCurrencies() {
    currencyList.innerHTML = `
        <p class="loading">Загружаем курсы валют...</p>
    `;

    try {
        const response = await fetch("/api/currencies");

        if (!response.ok) {
            throw new Error("Ошибка загрузки");
        }

        const data = await response.json();

        currencies = data.currencies;

        updateDate.textContent =
            "Дата курса: " +
            new Date(data.date).toLocaleDateString("ru-RU");

        renderCurrencies();

    } catch (error) {
        currencyList.innerHTML = `
            <p class="loading">
                Не удалось загрузить курсы валют.
                Попробуйте обновить страницу.
            </p>
        `;
    }
}

function renderCurrencies() {
    currencyList.innerHTML = "";

    currencies.forEach(currency => {
        const change = currency.value - currency.previous;

        const changeClass =
            change > 0 ? "positive" :
            change < 0 ? "negative" : "";

        const changeText =
            change > 0 ? "+" + formatPrice(change) :
            formatPrice(change);

        const item = document.createElement("div");

        item.className = "currency-item";

        const left = document.createElement("div");
        left.className = "currency-left";

        const code = document.createElement("div");
        code.className = "currency-code";
        code.textContent = currency.code;

        const info = document.createElement("div");

        const name = document.createElement("div");
        name.className = "currency-name";
        name.textContent = currency.name;

        const description = document.createElement("div");
        description.className = "currency-description";
        description.textContent = "За 1 единицу";

        info.append(name, description);
        left.append(code, info);

        const right = document.createElement("div");

        const price = document.createElement("div");
        price.className = "currency-price";
        price.textContent = formatPrice(currency.value) + " ₽";

        const changeElement = document.createElement("div");
        changeElement.className =
            "currency-change " + changeClass;

        changeElement.textContent =
            changeText + " ₽";

        right.append(price, changeElement);

        item.append(left, right);

        item.addEventListener("click", () => {
            openModal(currency);
        });

        currencyList.appendChild(item);
    });
}

function openModal(currency) {
    const change = currency.value - currency.previous;

    document.getElementById("modalCode").textContent =
        currency.code;

    document.getElementById("modalName").textContent =
        currency.name;

    document.getElementById("modalRate").textContent =
        formatPrice(currency.value);

    document.getElementById("detailCode").textContent =
        currency.code;

    document.getElementById("detailNominal").textContent =
        currency.nominal;

    document.getElementById("detailPrevious").textContent =
        formatPrice(currency.previous) + " ₽";

    const changeElement =
        document.getElementById("detailChange");

    changeElement.textContent =
        (change > 0 ? "+" : "") +
        formatPrice(change) + " ₽";

    changeElement.className =
        change > 0 ? "positive" :
        change < 0 ? "negative" : "";

    modal.classList.add("active");
}

function closeModal() {
    modal.classList.remove("active");
}

document.getElementById("closeModal")
    .addEventListener("click", closeModal);

document.getElementById("modalDone")
    .addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

document.getElementById("refreshButton")
    .addEventListener("click", loadCurrencies);

loadCurrencies();
