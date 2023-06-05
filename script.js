const popupCart = document.querySelector(".js-popup-cart");
const popupOrder = document.querySelector(".js-popup-order");
const showOrderBtn = document.querySelector(".js-show-order");
const popupCartList = document.querySelector(".js-popup-cart-list");
const headerCount = document.querySelector(".js-header-count");
const filterSelect = document.querySelector(".js-goods-filter");
const sortInputs = document.querySelectorAll(".js-goods-sort");
const notification = document.querySelector(".js-notification");
const notificationText = document.querySelector(".js-notification-content");
const ids = getAddedProducts();

setCount(ids.length);
getSearchParams("filter");
showOrderBtn.addEventListener("click", () => {
  hidePopup(popupCart);
  showPopup(popupOrder);
});

async function getGoods() {
  let url = "https://645918a24eb3f674df867d8d.mockapi.io/goods";
  let response = await fetch(url);
  return response.json();
}

function showProducts(goods, filterBy) {
  let productList = document.querySelector(".product-list");
  productList.innerHTML = "";

  switch (filterBy) {
    case "all":
      goods = [...goods];
      break;
    case "new":
    case "sale":
      goods = goods.filter((item) => item.badge === filterBy);
      break;
    case "low-price":
      goods = goods.filter((item) => item.price.current <= 1000);
      break;
    case "high-price":
      goods = goods.filter((item) => item.price.current > 1000);
      break;
  }

  goods.forEach((item) => {
    const article = document.createElement("article");
    article.classList.add("product-list__item", "tile", "js-product");
    article.setAttribute("data-id", item.id);

    article.innerHTML = `
        <a href="${item.href}" class="tile__link">
            <span class="tile__top">
                <span class="tile__badge tile__badge--${item.badge}">${item.badge}</span>
                <span class="tile__delete hidden js-delete-item"> 
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_6043_11153)">
                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_6043_11153">
                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                        </clipPath>
                        </defs>
                    </svg>
                </span>
            </span>
            <span class="tile__image">
                <img src="${item.images[0].preview}" alt="${item.title}">
            </span>
            <span class="tile__title">${item.title}</span>
            <span class="tile__sale-info sale">
                
            </span>
            <span class="tile__info">
                <span class="tile__price">
                    <span class="tile__old-price">${item.price.old} ₴</span>
                    <span class="tile__new-price">${item.price.current} ₴</span>
                </span>
                <button class="btn js-add-to-cart-btn">Купити</button>
            </span>
        </a>
    `;
    productList.appendChild(article);
  });
}

function showDeleteButton(ids) {
  let products = document.querySelectorAll(".js-product");
  products.forEach(function (product) {
    if (ids.includes(product.dataset.id)) {
      let deleteButton = product.querySelector(".js-delete-item");
      deleteButton.classList.remove("hidden");
    }
  });
}

function setCount(num) {
  headerCount.innerText = num;
}

function setCountEvent(products) {
  headerCount.addEventListener("click", () => {
    let addedToCartProducts = getAddedProducts();
    if (addedToCartProducts.length > 0) {
      showCartProducts(addedToCartProducts, products);
      showPopup(popupCart);
    }
  });
}

function getAddedProducts() {
  return localStorage.getItem("cart")?.split(", ") || [];
}

function removeFromCart(parent, isPopup = false) {
  let id = parent.dataset.id;
  let addedToCartProducts = getAddedProducts();
  let newProductsList = addedToCartProducts.filter((item) => item != id);
  newProductsList.length > 0
    ? localStorage.setItem("cart", newProductsList.join(", "))
    : localStorage.removeItem("cart");
  setCount(newProductsList.length);
  if (!isPopup) {
    let deleteButton = parent.querySelector(".js-delete-item");
    let tileTitle = parent.querySelector(".tile__title").innerText;
    deleteButton.classList.add("hidden");
    showNotification(tileTitle, "видалено");
  } else {
    let products = document.querySelectorAll(".js-product");
    products.forEach((product) => {
      if (product.dataset.id === id) {
        let deleteButton = product.querySelector(".js-delete-item");
        deleteButton.classList.add("hidden");
      }
    });
  }
}

function addToCart(button) {
  let parent = button.closest(".product-list__item");
  let deleteButton = parent.querySelector(".js-delete-item");
  let id = parent.dataset.id;
  let tileTitle = parent.querySelector(".tile__title").innerText;
  let addedToCartProducts = getAddedProducts();

  deleteButton.classList.remove("hidden");
  addedToCartProducts.push(id);
  localStorage.setItem("cart", addedToCartProducts.join(", "));
  setCount(addedToCartProducts.length);
  showNotification(tileTitle, "додано");
}

function showNotification(productName, text) {
  notification.classList.add("notification--active");
  notificationText.innerText = `Продукт ${productName} успішно ${text}!`;
  setTimeout(() => notification.classList.remove("notification--active"), 3000);
}

function showPopup(popup) {
  let popupClose = popup.querySelector(".js-popup-close");
  popup.classList.add("popup--active");
  popupClose.addEventListener("click", () => hidePopup(popup));
}
function hidePopup(popup) {
  popup.classList.remove("popup--active");
}

function showCartProducts(productIds, goods) {
  popupCartList.innerHTML = "";
  goods.forEach((item) => {
    if (productIds.includes(String(item.id))) {
      let filtered = productIds.filter((el) => el === String(item.id));
      let counter = filtered.length;
      let itemList = document.createElement("li");
      itemList.className = "popup-cart__list-item cart-item";
      itemList.dataset.id = item.id;
      itemList.innerHTML = `<span class="cart-item__img">
                                    <img src="${item.images[0].preview}" alt="${
        item.title
      }">
                                </span>
                                <span class="cart-item__info">
                                    <a href="${
                                      item.href
                                    }" class="cart-item__link">
                                        <span class="cart-item__title">${
                                          item.title
                                        }</span>
                                        <span class="cart-item__price">
                                            <span class="tile__count">${counter}</span>
                                            <span class="tile__price">Вартість - ${
                                              item.price.current
                                            } ₴</span>
                                            <span class="tile__total-price">Сума - ${
                                              item.price.current * counter
                                            } ₴</span>
                                        </span>
                                    </a>
                                </span>
                                <span class="cart-item__remove js-cart-remove">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_6043_11153)">
                                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                        <clipPath id="clip0_6043_11153">
                                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                                        </clipPath>
                                        </defs>
                                    </svg>
                                </span>`;
      popupCartList.appendChild(itemList);
    }
  });
  setPopupCartRemove();
}

function setPopupCartRemove() {
  let removeBtns = document.querySelectorAll(".js-cart-remove");

  removeBtns.forEach((btn) =>
    btn.addEventListener("click", function () {
      let parent = btn.closest(".cart-item");
      parent.classList.add("hidden");
      removeFromCart(parent, true);
    })
  );
}

function sortProducts(e, products) {
  let value = e.target.value;
  let sortedProducts = [...products];

  switch (value) {
    case "price":
      sortedProducts = products.sort((a, b) =>
        a.price.current > b.price.current ? 1 : -1
      );
      break;
    case "alphabet":
      sortedProducts = products.sort((a, b) => (a.title > b.title ? 1 : -1));
      break;
  }

  showProducts(sortedProducts);
}

function setSort(arr) {
  sortInputs.forEach((input) =>
    input.addEventListener("change", (e) => sortProducts(e, arr))
  );
}

function setFilter(arr) {
  filterSelect.addEventListener("change", (e) => getFilteredProducts(e, arr));
}

function getFilteredProducts(e, products) {
  let value = e.target.value;
  let filteredProducts = null;

  if (value == "all") {
    setSearchParams("filter", "");
    filteredProducts = [...products];
  } else {
    setSearchParams("filter", value);
    filteredProducts = products.filter((item) => item.tag_list.includes(value));
  }

  showProducts(filteredProducts);
}

function setSearchParams(key, value) {
  let currentUrl = window.location;
  let url = new URL(currentUrl);
  let params = new URLSearchParams(url.search);

  if (value === "") {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  url.search = params.toString();
  window.location.href = url.toString();
}

function getSearchParams(key) {
  let currentUrl = window.location;
  let url = new URL(currentUrl);
  let params = new URLSearchParams(url.search);
  let search = params.get(key);

  if (search) {
    setCurrentOption(search);
  }

  getGoods().then((result) => {
    showProducts(result, search);
    setSort(result);
    setFilter(result);
    showDeleteButton(ids);
    setBtnProductsEvent();
    setCountEvent(result);
  });
}

function setCurrentOption(val) {
  filterSelect
    .querySelector(`option[value=${val}]`)
    .setAttribute("selected", "selected");
}

function setBtnProductsEvent() {
  let deleteButtons = document.querySelectorAll(".js-delete-item");
  let addToCartButtons = document.querySelectorAll(".js-add-to-cart-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(btn.closest(".product-list__item"));
    });
  });

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(button);
    });
  });
}

// HW 6
// //  part 2. BANNER-------------------------------

// function showBanner() {
//   let currentTime = new Date().getTime();
//   if (
//     localStorage.getTime("close time") == null ||
//     currentTime - localStorage.getTime("close time") > 604800000
//   ) {
//     setTimeout(() => {
//       saleBanner.classList.remove("hidden");
//     }, 3000);
//     document
//       .querySelector(".js-sale-banner-close")
//       .addEventListener("click", (e) => {
//         saleBanner.classList.add("hidden");
//         let closeTime = new Date().getTime();
//         localStorage.setItem("close time", `${closeTime}`);
//       });
//   }
// }
// showBanner();

//
// function showSaleCounter(goods) {
//   goods.forEach((item) => {
//     if (item.badge == "sale") {
//       let elem = document.querySelector(`[data-id = '${item.id}']`);
//       elem.querySelector(
//         ".sale"
//       ).innerHTML = ` <span class="sale__text">Акція діє до 01.04.2023</span> <span class="sale__counter"></span>`;
//     }
//   });
//   showCountdown();
// }
// showSaleCounter(goods);
// function showCountdown() {
//   let endDate = new Date(2023, 3, 1).getTime();
//   counters = document.querySelectorAll(".sale__counter");
//   today = new Date().getTime();
//   remaining = endDate - today;
//   seconds = Math.floor((remaining / 1000) % 60);
//   if (seconds.toString().length < 2) {
//     seconds = `0${seconds}`;
//   }
//   minutes = Math.floor((remaining / 1000 / 60) % 60);
//   if (minutes.toString().length < 2) {
//     minutes = `0${minutes}`;
//   }
//   hours = Math.floor(((remaining / 1000) * 60 * 60) % 24);
//   if (hours.toString().length < 2) {
//     hours = `0${hours}`;
//   }
//   days = Math.floor(remaining / (1000 * 60 * 60 * 24));
//   counters.forEach((i) => {
//     i.classList.add("sale__counter--active");
//     i.innerText = `До кінця окції  ${days} днів ${hours} : ${minutes} :${seconds}`;
//   });
//   setInterval(() => showCountdown(), 1000);
// }

//  Timer
// HW 6
function showTimer() {
  const badgeSale = document.querySelectorAll(".tile__badge--sale");
  const span = `<span class="tile__sale-info sale">
                    <span class="sale__text">Акція діє до 01.04.2023</span>
                    <span class="sale__counter"></span>
                </span>`;

  badgeSale.forEach((elem) => {
    const parent = elem.closest(".tile__link");
    const childEl = parent.querySelector(".sale");
    childEl.innerHTML = span;
  });
}

function setCounter() {
  const counter = document.querySelectorAll(".sale__counter");
  const timeOf = new Date(2023, 3, 1);
  let timeId = null;
  let remaining = timeOf - new Date();
  if (remaining <= 0) {
    clearInterval(timeId);
  }
  let days = remaining > 0 ? Math.floor(remaining / (1000 * 60 * 60 * 24)) : 0;
  let hours = remaining > 0 ? Math.floor(remaining / 1000 / 60 / 60) % 24 : 0;
  let minutes = remaining > 0 ? Math.floor(remaining / 1000 / 60) % 60 : 0;
  let seconds = remaining > 0 ? Math.floor(remaining / 1000) % 60 : 0;

  counter.forEach((item) => {
    item.innerText = `${days} дні ${hours} год ${minutes} хв ${seconds} сек`;
  });
}
function getCards(goods) {
  goods.then((res) => {
    res.forEach(() => {
      showTimer();
      setCounter();
      timeId = setInterval(setCounter, 1000);
    });
  });
}
getCards(getGoods());

//  part 2. BANNER-------------------------------

const banner = document.querySelector(".js-sale-banner");
const cross = document.querySelector(".js-sale-banner-close");
banner.classList.add("hidden");

function getBanner() {
  const closeTime = new Date();
  const futureTime = closeTime.getTime() + 6.048e8;
  const storageDate = +localStorage.getItem("date");

  if (!storageDate) {
    banner.classList.remove("hidden");
    clickCross();
  } else {
    if (closeTime.getTime() >= storageDate) {
      banner.classList.remove("hidden");
      localStorage.removeItem("date");
    }
  }
  clickCross(futureTime);
}
setTimeout(getBanner, 3000);

function clickCross(futureTime) {
  cross.addEventListener("click", () => {
    banner.classList.add("hidden");
    localStorage.setItem("date", futureTime);
  });
}
