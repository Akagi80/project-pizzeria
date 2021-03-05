import {templates, select} from '/js/settings.js';
import AmountWidget from '/js/components/AmountWidget.js';
import DatePicker from '/js/components/DatePicker.js';
import HourPicker from '/js/components/HourPicker.js';

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
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    console.log(thisBooking.dom.datePicker);
    console.log(thisBooking.dom.hourPicker);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); // tworzymy instancję AmountWidget dla peopleAmount
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); // tworzymy instancję AmountWidget dla hoursAmount
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('update', function() {

    });

    thisBooking.dom.hoursAmount.addEventListener('update', function() {

    });

    thisBooking.dom.datePicker.addEventListener('update', function() {

    });

    thisBooking.dom.hourPicker.addEventListener('update', function() {

    });
  }
}

export default Booking;
