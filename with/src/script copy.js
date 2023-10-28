import createObserver, { buildThresholdList } from './observer.js';
import api from './api.js';
const cssEndpoint = 'https://fonts.googleapis.com/css?family=';

let loadedIndex = 0;
let fonts;
const controlElement = document.getElementById('control');

function loadFonts(f) {
  const container = document.getElementById('infinite-scroll');
  f.forEach((font) => {
    const newFont = document.createElement('div');
    newFont.innerText = font.family;
    newFont.style.fontFamily = `${font.family}, ${font.category}`;
    container.appendChild(newFont);
    const observer = createObserver(handleOpacity, '0px', buildThresholdList(4));
    observer.observe(newFont);
  });

  const fontFamilies = f.map((font) => font.family);

  const cssUrl = `${cssEndpoint}${fontFamilies.join('|')}`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  document.querySelector('head').appendChild(link);

  const refElement = document.querySelector('#infinite-scroll > div:nth-last-child(10)');
  controlElement.parentNode.insertBefore(controlElement, refElement);

  loadedIndex += f.length;
  console.log(loadedIndex);
}

function handleOpacity(entries) {
  entries[0].target.style.opacity = entries[0].intersectionRatio;
  // console.log(entries);
}

function handleLoad(entries) {
  if (entries[0].intersectionRatio <= 0) return;
  loadFonts(fonts.slice(loadedIndex, loadedIndex + 10));
}

window.addEventListener(
  'load',
  async () => {
    fonts = (await api.fetchFonts()).items;
    console.log(fonts);
    loadFonts(fonts.slice(0, 40));

    const observer = createObserver(handleLoad, '0px', 1);
    observer.observe(controlElement);
  },
  false
);
