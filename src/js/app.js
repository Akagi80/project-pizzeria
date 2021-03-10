import {settings, select, classNames} from '/js/settings.js';
import Product from '/js/components/Product.js';
import Cart from '/js/components/Cart.js';
import Booking from '/js/components/Booking.js';
import Home from '/js/components/Home.js';

export const app = {
  initPages: function () { // metogda która jest odpalana po odświeżeniu strony
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children; // wszystkie dzieci kontenera stron (order i booking)
    thisApp.navLinks = document.querySelectorAll(select.nav.links); // wszystkie linki prowadzące do pdstron

    const idFromHash = window.location.hash.replace('#/', ''); // z hasha url strony uzyskujemy id strony która ma być otwarta jako domyślna

    // pętla która sprawdza czy podstrona (adres) pacuje do id strony (idFromHash) jeżeli nie to zostaje otwarta pierwsza podstrona zapisana w zmiennej pageMathingHash!
    let pageMathingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if(page.id == idFromHash) {
        pageMathingHash = page.id;
        break;
      }
    }

    //console.log('pageMathingHash', pageMathingHash);
    thisApp.activatePage(pageMathingHash); // aktywujemy odpowiednia podstronę


    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', ''); // zapisujemy do słaej "id" artubyt "href" kliknietego elementu w którym zamieniamy znak # na pusty znak np "#order" na "order"

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id); // aktywujemy odpowiednia (id) podstronę

        /* change URL hash */
        window.location.hash = '#/' + id; // dodaliśly slash po hash '#/' aby domyślnie strona się nie przewijała do elementu #order
      });
    }
  },

  activatePage: function(pageId) { // UWAGA pageId to order lub booking!!!
    const thisApp = this;

    /* add calss "active" to matching pages, remove from non-mathing */
    for(let page of thisApp.pages) {
    //  if(page.id == pageId) {
    //    page.classList.add(classNames.pages.active);
    //  } else {
    //    page.classList.remove(classNames.pages.active);
    //  }
      page.classList.toggle(classNames.pages.active, page.id == pageId); // UPROSZCZENIE zakomendowanej powyżej poętli:  toogle to przełącznik klass (dodaje jednej podstronie i odbiera drugiej)
    }

    /* add calss "active" to matching links, remove from non-mathing */
    for(let link of thisApp.navLinks) { // dla każdego z linków (link) zapisanych w thisApp.navLinks...
      link.classList.toggle( // dodajemy lub usuwamy...
        classNames.nav.active, // klasę zdefiniowaną w classNames.nav.active..
        link.getAttribute('href') == '#' + pageId //w zależności od tego czy atrubut 'href' tego linka jest równy #pageId (argument metody: activatePage: function(pageId))
      );
    }
  },

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
        //console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method*/
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function() { // I Pierwsza uruchamiana metoda która odpala initData i initMenu
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();

    thisApp.initHome();
    
    thisApp.initCart();

    thisApp.initBooking(); // 10.4 wywołujemy metodę initBooking
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

  initBooking: function () {
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking); // 10.4 znajdujemy kontener
    thisApp.booking = new Booking(bookingElem); // 10.4 tworzymy nową instancję klasy Booking i przekazujemy do konstruktora kontener bookingElem
  },
  initHome: function() {
    const thisApp = this;

    const homeElem = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homeElem);
  }
};

app.init();
//app.initCart();