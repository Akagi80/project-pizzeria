import {templates, select} from '/js/settings.js';
import {app} from '/js/app.js';


class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initCarousel();
    thisHome.initAction();
  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.home(); // generujemy HTML z szablonu templates.home

    thisHome.dom = {}; // tworzymy pusty obiekt thisHome.dom

    thisHome.dom.wrapper = element; // do obiektu thisHome.dom dodajemy właściwość 'wrapper' i przypisujemy do niej referencję do kontenera z argumentu metody (element)
    thisHome.dom.wrapper.innerHTML = generatedHTML; // zmieniamy wartość wrappera innerHTML na kod HTML wygenerowany z szablonu generatedHTML
    thisHome.dom.order = document.querySelector(select.home.order);
    thisHome.dom.booking = document.querySelector(select.home.booking);
  }

  initCarousel() {
    const elem = document.querySelector('.main-carousel');

    new Flickity(elem, { // eslint-disable-line
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
    });
  }

  initAction() {
    const thisHome = this;
    thisHome.dom.order.addEventListener('click', function() {
      app.activatePage('order');
      window.location.hash = '#/order';
    
      console.log('clicked order');
    });

    thisHome.dom.booking.addEventListener('click', function() {
      app.activatePage('booking');
      console.log('clicked booking');
      window.location.hash = '#/booking';
    });
  }
}

export default Home;
