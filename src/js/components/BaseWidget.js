class BaseWidget {
  // tworzymy konstruktor z dwoma argumentami: wrapperElement (element DOM w którym znajduje się ten widget) oraz initialValue (początkowa wartość widgetu)
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() { //getter czyli metoda wykonywana przy każdej próbie odczytania wartości "value"
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) { //setter mwtoda która jest wykonywana przy każdej próbie ustawienia nowej wartości właściwości "value"
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); // presentInt(value) konwertuje liczkę zapisaną jako tekst (input tak ZAWSZE zapisuje) np '8' na właściwie zapisaną 8

    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) { //thisWidget.correctValue zmieni się tylko wtedy, jeśli nowa wpisana w input wartość będzie inna niż obecna.

      thisWidget.correctValue = newValue;
    }

    thisWidget.renderValue();
    thisWidget.announce();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value); // !isNaN sprawdza czy newValue JEST liczbą,
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    // stworzony Event nazywamy updated
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
