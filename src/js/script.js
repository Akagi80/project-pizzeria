/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  // 1. Tworzymy pustą klasę:
  class Product {
    constructor (id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderFrom();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      // console.log('new Product: ', thisProduct);
    }
    renderInMenu() {  //metoda która generuje HTML, dodaje DOM, wyszukuje kontener, wstawia DOM do kontenera.
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML (DOM)*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* finde menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      // console.log('generatedHTML: ', generatedHTML);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.dom = {};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log('thisProductFromInputs: ', thisProduct.formInputs);
    }

    initOrderFrom() {
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

      // console.log('initOrderFrom: ', this.initOrderFrom);
    }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      // console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;
      //console.log(thisProduct.data.price);

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('param: ',paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('option: ', optionId, option);

          // finde all images    ----   8.7
          //console.log('paramId, optionId: ', paramId, optionId);
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          // console.log('optionImage: ', optionImage);

          // check if there is param with a name of paramId in formData and if it includes optionId
          // czy dana opcja (optionId) danej kategorii (paramId) jest wybrana w formularzu (formData)
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            // console.log(formData[paramId]);

            // add extra images - not remove yet...    ----     8.7
            if(optionImage) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }

            // check if the option is not default - czy opcja NIE posiada default
            if(!option.default) {

              // add option price to price variable - jeżeli opcja jest oznaczona i NIE posiada default podnosi cenę
              price = price + option.price;
            }

          } else if(option.default) {
            // check if the option is default - czy opcja JEST default

            // reduce price variable - jeżeli opcja JEST default i zostaje odznaczona obniza cenę
            price = price - option.price;

            // remove uncheck images      ----     8.7
            if(optionImage) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }

          }  else if(optionImage) {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

      }

      thisProduct.priceSingle = price;  // --- 9.4 ---

      /* multiply price by amount  ----  mnożymy cenę za wybrany produkt przez liczbę sztuk */
      price *= thisProduct.amountWidget.value;
      //console.log(thisProduct.amountWidget.value);

      //thisProduct.price = price;  //  --- 9.4 ---

      // update calculated price in the HTML ---- ostateczne wyświetlenie ceny pod produktem
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); --- mod. 8.6 skraca zapis dzięki getElements

      /* START: add event listener to clickable trigger on event click */
      // clickableTrigger.addEventListener('click', function(event) { --- mod. 8.6 skraca zapis dzięki getElements
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.active');

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

      // nasłuchiwacz elementu: --thisProduct.dom.amountWidgetElem-- na zdarzenie: --update-- na anonimową funkcję: --thisProduct.processOrder()--
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.amount * productSummary.priceSingle;
      productSummary.params = thisProduct.prepareCartProductParams();

      //console.log('productSummary.params: ', productSummary.params);
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};

      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
          //console.log('optionSelected: ', optionSelected);
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.setValue(thisWidget.input.value);

      //console.log('AmountWigdet: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.value = settings.amountWidget.defaultValue; // stąd pobieramy domyślną ilość produktów   -- 9.1
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value); // presentInt(value) konwertuje liczkę zapisaną jako tekst (input tak ZAWSZE zapisuje) np '8' na właściwie zapisaną 8

      //console.log(thisWidget, value);

      /* TODO: Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) { //thisWidget.value zmieni się tylko wtedy, jeśli nowa wpisana w input wartość będzie inna niż obecna. !isNaN sprawdza czy newValue JEST liczbą,

        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated'); // stworony Event nazywamy updated
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Card: ', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);  // --- 9.4 ---
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);

      /* create element using utils.createElementFromHTML (DOM)*/

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* finde menu container */

      /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);

      //console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update() {
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for(let product of thisCart.products) {
        console.log('product',product, thisCart.porducts);
        totalNumber = totalNumber + product.amount;
        subtotalPrice = subtotalPrice + product.price;
      }
      if(subtotalPrice != 0) {
        thisCart.totalPrice = deliveryFee + subtotalPrice;
      }
      console.log('Wartości koszyka', deliveryFee, totalNumber, subtotalPrice, thisCart.totalPrice);
    }
  }

  // Dodajemy nową klasę do obsługi pojedyńczych produktów znajdujących się w koszyku --- 9.5 ---
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      //console.log('thisCartProduct', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });

    }
  }

  // 2. Tworzymy pierwszą instancję
  const app = {
    initMenu: function() { // metoda app.initMenu przejdzie po każdym produkcie z osobna (np. cake czy breakfast) i stworzy dla niego instancję Product, czego wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.
      const thisApp = this;

      // console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() { // Zapewnmia łaty dostęp do danych. Przypisuje włąśniwości całego obiektu app do dataSource czyli danych z których będziemy kożystać w aplikacji (min. products)
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function() { // I Pierwsza uruchamiana metoda która odpala initData i initMenu
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
  //app.initCart();
}
