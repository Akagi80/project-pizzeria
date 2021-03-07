import {templates, select, settings, classNames} from '/js/settings.js';
import utils from '/js/utils.js';
import AmountWidget from '/js/components/AmountWidget.js';
import DatePicker from '/js/components/DatePicker.js';
import HourPicker from '/js/components/HourPicker.js';

class Booking {
  constructor(element) { // konstruktor odbierający referencję do kontenera (np. element)
    const thisBooking = this;

    thisBooking.render(element); // wywołujemy metodę render z dostępem do kontenera (element)
    thisBooking.initWidgets(); // wywołujemy metodę initWidgets
    thisBooking.getData(); // wywołujemy metodę określania daty rezerwacji
    thisBooking.resTable = null; // 11.3.2
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking : [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = { //obiekt przechowywujący dane rezerwacji podzielony na:
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'), // adres endpointu API, który zwraca listę rezerwacji
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'), // zwraca listę wydarzeń (rezerwacji) jednorazowych
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'), // zwraca listę wydarzeń (rezerwacji) cyklicznych
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking), // pobieramy z API informacje o rezerwacji
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all ([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    // Pętla sprawdzająca zajętość stolika przez wydarzenia cykliczne
    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    // pętla sprawdzająca jak długo zajęty jest stolik
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      // usuwamy oznaczenie stolika po zmianie godziny, liczby osób etc. 11.3.6...
      table.classList.remove(classNames.booking.tableSelected);
      thisBooking.resTable = null;

      if(!allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(); // generujemy HTML z szablonu templates.bookingWidget

    thisBooking.dom = {}; // tworzymy pusty obiekt thisBooking.dom

    thisBooking.dom.wrapper = element; // do obiektu thisBooking.dom dodajemy właściwość 'wrapper' i przypisujemy do niej referencję do kontenera z argumentu metody (element)
    thisBooking.dom.wrapper.innerHTML = generatedHTML; // zmieniamy wartość wrappera innerHTML na kod HTML wygenerowany z szablonu generatedHTML
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); // dostęp do inputu peopleAmount
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount); // dostęp do inputu hoursAmount
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.allTables = element.querySelector(select.booking.allTables); // 11.3.3
    thisBooking.dom.form = element.querySelector(select.booking.form);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);
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

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.allTables.addEventListener('click', function() { // 11.3.4
      thisBooking.initTables();
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables() { // 11.3.5
    const thisBooking = this;

    const clickedElement = event.target;
    const tableId = clickedElement.getAttribute('data-table');

    // sprawdzamy czy stolik jest już zajęty
    if(!clickedElement.classList.contains(classNames.booking.tableBooked)) {
      thisBooking.resTable = tableId;
      console.log(thisBooking.resTable);
    } else {
      alert('Niestety, stolik jest już zajęty');
    }

    // Przypisanie klasy selected do zaznaczonego stolika 11.3.5 / 11.3.6
    for(let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tableSelected);
      if (clickedElement.classList.contains('table') && thisBooking.resTable == tableId) {
        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.resTable = tableId;
      } else {
        thisBooking.resTable = null;
        clickedElement.classList.remove(classNames.booking.tableSelected);
      }
    }
    if(!clickedElement.classList.contains(classNames.booking.tableSelected)) {
      thisBooking.resTable = null;
    }
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const reservation = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.resTable),
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for(let starter of thisBooking.dom.starters) {
      if(starter.checked == true) {
        reservation.starters.push(starter.value);
      }
    }
    console.log('reservation: ', reservation);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservation),
    };

    fetch(url, options);
  }
}

export default Booking;
