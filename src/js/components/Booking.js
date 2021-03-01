import {templates} from '/js/settings.js';

class Booking {
  constructor(element) { // konstruktor odbierający referencję do kontenera (np. element)
    const thisBooking = this;

    thisBooking.render(element); // wywołujemy metodę render z dostępem do kontenera (element)
    thisBooking.initWidgets(); // wywołujemy metodę initWidgets
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(); // generujemy HTML z szablonu templates.bookingWidget

    thisBooking.dom = {}; // tworzymy pusty obiekt thisBooking.dom
    
    thisBooking.dom.wrapper = element; // do obiektu thisBooking.dom dodajemy właściwość 'wrapper' i przypisujemy do niej referencję do kontenera z argumentu metody (element)
    thisBooking.dom.wrapper.innerHTML = generatedHTML; // zmieniamy wartość wrappera innerHTML na kod HTML wygenerowany z szablonu generatedHTML
  }
}

export default Booking;
