import {select, classNames, templates} from '/js/settings.js';
import utils from '/js/utils.js';
import AmountWidget from '/js/components/AmountWidget.js';

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
      const activeProduct = document.querySelector(select.all.menuProductsActive);

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

    //  app.cart.add(thisProduct.prepareCartProduct());
    //  10.3 Wukorzystujemy castomowy event !!!! w app.js (initCart) będziemy musieli go nasłuchiwać!!!!
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;

