import api from './api.js';
import createObserver, { buildThresholdList } from './observer.js';

let data = [];
let filteredFonts = [];
let loadedFonts = [];
let currentSortingMethod = '';
const categories = ['sans-serif', 'serif', 'monospace', 'handwriting', 'display'];

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
}

function loadFonts(fontFamilies) {
  const baseURL = 'https://fonts.googleapis.com/css?family=';
  const URL = `${baseURL}${fontFamilies.join('|')}&display=swap`;
  const newLink = document.createElement('link');
  newLink.setAttribute('rel', 'stylesheet');
  newLink.setAttribute('href', URL);
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

    // Create an IntersectionObserver to change element opacity
    createObserver(
      newListItem,
      (entries) => {
        entries[0].target.style.opacity = entries[0].intersectionRatio;
      },
      buildThresholdList(10)
    );

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

    // Create an IntersectionObserver to create the next elements in the list
    createObserver(controlElement, (entries) => {
      // If the intersection ratio is 0 or less, the control element is out of
      // view and we don't need to do anything.
      if (entries[0].intersectionRatio <= 0) return;
      createListItems(10);
    });
  }

  // Load fonts if they are not already loaded
  if (familiesToLoad.length) {
    loadFonts(familiesToLoad);
  }
}

async function getData(selectedMethod) {
  // Create loading element
  const loadingElement = document.createElement('div');
  loadingElement.setAttribute('class', 'loading');
  scrollableList.appendChild(loadingElement);

  // Make the request
  data = (await api.fetchFontsBy(selectedMethod)).items;
  currentSortingMethod = selectedMethod;

  // Remove loading
  loadingElement.remove();
}

async function createNewList(formData) {
  // Remove all elements from the list
  while (scrollableList.hasChildNodes()) {
    scrollableList.removeChild(scrollableList.firstElementChild);
  }

  // If necessary, make a request to get the fonts in a specific order
  const selectedMethod = formData.get('sorting-method');

  if (selectedMethod !== currentSortingMethod) {
    await getData(selectedMethod);
  }

  // Filter data and create list elements
  filterData(formData);

  if (filteredFonts.length) {
    createListItems(10);
  }

  // Scroll to the top
  scrollableList.scrollTo(0, 0);
}

window.addEventListener('load', async () => {
  const filterForm = document.getElementById('filter-form');

  createNewList(new FormData(filterForm));

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    createNewList(new FormData(filterForm));
  });
});
