function initToggler() {
  const ele = document.querySelector('.playground__toggler#playground-toggler');
  const pl = document.querySelector('.playground#playground');
  ele.addEventListener('click', () => {
    ele.classList.toggle('is-active')
    pl.classList.toggle('playground--active');
  })
}

function initMenuScroll() {
  const ele = document.querySelector('.menu#menu');
  const inner = document.querySelectorAll('.menu#menu .menu__inner');
  const handler = (eventTarget: EventTarget | HTMLElement) => {
    const target = (eventTarget as HTMLElement)
    const scrollTop = target.scrollTop;
    if (scrollTop > 0) {
      ele.classList.add('menu--top-shaded')
    }
    else {
      ele.classList.remove('menu--top-shaded')
    }

    if (target.scrollHeight - target.getBoundingClientRect().height - scrollTop > 0) {
      ele.classList.add('menu--bot-shaded')
    }
    else {
      ele.classList.remove('menu--bot-shaded')
    }
  }

  inner.forEach((el) => {
    handler(el);
    el.addEventListener('scroll', (e) => {
      handler(e.currentTarget);
    })
    window.addEventListener('resize', (e) => {
      handler(el);
    })
  })
}

function initMenuLink() {
  const ele = document.querySelectorAll('.menu#menu .menu__link');
  const toggler = document.querySelector('.playground__toggler#playground-toggler');
  const pl = document.querySelector('.playground#playground');
  ele.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggler.classList.remove('is-active');
      pl.classList.remove('playground--active');
      const route = el.getAttribute('data-route');
      window.location.hash = `#${route}`;
    })
  })
}

function initIframeOnLoad() {
  const content = document.querySelector('iframe#playground-content');
  const loading = document.querySelector('#loading');
  content.addEventListener('load', () => {
    loading.classList.remove('playground__loading--active');
  }, true)
}

function hashHandler() {
  const hash = location.hash;
  const content = document.querySelector('iframe#playground-content');
  const hashID = hash.replace(/^#(.*)/g, `$1`);
  const loading = document.querySelector('#loading');
  const menuLinkElements = document.querySelectorAll('#menu .menu__item .menu__link');
  const menuLinks = Array.prototype.map.call(menuLinkElements, (element: HTMLElement) => {
    return element.innerHTML;
  })
  if (menuLinks.includes(hashID)) {
    content.setAttribute('src', 'examples/' + hashID + '.html');
    loading.classList.add('playground__loading--active')
  }
  else {
    const url = new URL(window.location.href);
    url.hash = '';
    history.replaceState(null, document.title, url);
  }
}

function initHashMechanic() {
  hashHandler();
  window.addEventListener('hashchange', () => {
    hashHandler();
  })
}


function main() {
  initToggler();
  initMenuLink();
  initMenuScroll();
  initIframeOnLoad();
  initHashMechanic();
}

window.onload = main;