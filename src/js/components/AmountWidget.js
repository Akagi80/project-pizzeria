import {select, settings} from '/js/settings.js';
import BaseWidget from '/js/components/BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();
    thisWidget.renderValue();
    // thisWidget.setValue(thisWidget.input.value); usunięty w 11.1 !!!

    //console.log('AmountWigdet: ', thisWidget);
    //console.log('constructor arguments: ', element);
  }

  getElements() {
    const thisWidget = this;

    // thisWidget.element = element; usuniety w 11.1!! bo nim zajmie się BaseWidget
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    // thisWidget.value = settings.amountWidget.defaultValue; // stąd pobieramy domyślną ilość produktów   -- 9.1  --- usuniety w 11.1!!
  }

  isValid(value) {
    return !isNaN(value) // !isNaN sprawdza czy newValue JEST liczbą,
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;
