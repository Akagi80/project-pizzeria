import {templates, select} from '/js/settings.js';
import AmountWidget from '/js/components/AmountWidget.js';

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
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount); // dostęp do inputu peopleAmount
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount); // dostęp do inputu hoursAmount
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); // tworzymy instancję AmountWidget dla peopleAmount
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); // tworzymy instancję AmountWidget dla hoursAmount

    thisBooking.dom.peopleAmount.addEventListener('update', function() {

    });

    thisBooking.dom.hoursAmount.addEventListener('update', function() {

    });

  }
}

export default Booking;
