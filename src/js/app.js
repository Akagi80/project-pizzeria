import {settings, select} from '/js/settings.js';
import Product from '/js/components/Product.js';
import Cart from '/js/components/Cart.js';

const app = {
  initMenu: function() { // metoda app.initMenu przejdzie po każdym produkcie z osobna (np. cake czy breakfast) i stworzy dla niego instancję Product, czego wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.
    const thisApp = this;

    // console.log('thisApp.data: ', thisApp.data);

    for(let productData in thisApp.data.products) {
      //new Product(productData, thisApp.data.products[productData]);   --- zmiana w 9.8 ---
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() { // Zapewnmia łaty dostęp do danych. Przypisuje włąśniwości całego obiektu app do dataSource czyli danych z których będziemy kożystać w aplikacji (min. products)
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method*/
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function() { // I Pierwsza uruchamiana metoda która odpala initData i initMenu
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    // thisApp.initMenu(); --- zmiana w 9.8 ---
    thisApp.initCart();
  },

  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    // 10.3 Nasłuchuijemy castom event z Product.js (addToCart) !!!!
    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },
};

app.init();
//app.initCart();
