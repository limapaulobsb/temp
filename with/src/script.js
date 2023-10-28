import api from './api.js';
import createObserver, { buildThresholdList } from './observer.js';

let data = [];
let filteredFonts = [];
let loadedFonts = [];
const categories = ['sans-serif', 'serif', 'monospace', 'handwriting', 'display'];

const filterForm = document.getElementById('filter-form');
const scrollableList = document.getElementById('scrollable-list');

function filterData(formData) {
  filteredFonts = data.filter(({ category: fontCategory, family: fontFamily }) => {
    let criteria = false;

    categories.forEach((category) => {
      if (formData.get(category) === 'on') {
        criteria ||= fontCategory === category;
      }
    });

    const query = formData.get('query');

    if (query) {
      const re = new RegExp(query, 'i');
      criteria &&= re.test(fontFamily);
    }

    return criteria;
  });

  console.log(filteredFonts.length);
}

function loadFonts(fontFamilies) {
  const url = `https://fonts.googleapis.com/css?family=${fontFamilies.join('|')}`;
  const newLink = document.createElement('link');
  newLink.setAttribute('rel', 'stylesheet');
  newLink.setAttribute('href', url);
  document.querySelector('head').appendChild(newLink);
  loadedFonts = [...loadedFonts, ...fontFamilies];
}

function createListItems(n) {
  // Remove the control element, if it exists
  let controlElement = document.getElementById('control');
  controlElement?.remove();

  //
  const filteredCount = filteredFonts.length;
  const itemCount = () => scrollableList.childElementCount;
  const remainingCount = filteredCount - itemCount();
  const toBeCreated = Math.min(n, remainingCount);
  const familiesToLoad = [];

  // Create items
  for (let i = 0; i < toBeCreated; i++) {
    const fontIndex = itemCount();
    const fontFamily = filteredFonts[fontIndex].family;
    const fontCategory = filteredFonts[fontIndex].category;
    const newListItem = document.createElement('li');
    newListItem.style.fontFamily = `${fontFamily}, ${fontCategory}`;
    newListItem.innerText = fontFamily;
    scrollableList.appendChild(newListItem);

    if (!loadedFonts.includes(fontFamily)) {
      familiesToLoad.push(fontFamily);
    }
  }

  // Create control element if list is not fully loaded
  if (itemCount() < filteredCount) {
    controlElement = document.createElement('div');
    controlElement.setAttribute('id', 'control');
    const referenceElement = scrollableList.querySelector('li:nth-last-child(2)');
    scrollableList.insertBefore(controlElement, referenceElement);

    createObserver(controlElement, (entries) => {
      // If the intersection ratio is 0 or less, the element is out of view and
      // we don't need to do anything.
      if (entries[0].intersectionRatio <= 0) return;
      createListItems(10);
    });
  }

  // Load fonts if they are not already loaded
  if (familiesToLoad.length) {
    loadFonts(familiesToLoad);
  }
}

function createNewList() {
  while (scrollableList.hasChildNodes()) {
    scrollableList.removeChild(scrollableList.firstElementChild);
  }

  const formData = new FormData(filterForm);
  filterData(formData);

  if (filteredFonts.length) {
    createListItems(10);
  }

  //
  scrollableList.scrollTo(0, 0);
}

window.addEventListener('load', async () => {
  data = (await api.fetchFonts()).items;

  createNewList();

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    createNewList();
  });
});
