import api from './api.js';

let data = [];

let fontList = [];
let createdIndex = -1;
let loadedFonts = [];
const maxFirstCreationCount = 10;

const scrollableList = document.getElementById('scrollable-list');

function filterFonts(formData) {
  fontList = data.filter(({ category, family }) => {
    let criteria = false;

    if (formData.get('sans-serif') === 'on') {
      criteria ||= category === 'sans-serif';
    }

    if (formData.get('serif') === 'on') {
      criteria ||= category === 'serif';
    }

    if (formData.get('monospace') === 'on') {
      criteria ||= category === 'monospace';
    }

    if (formData.get('handwriting') === 'on') {
      criteria ||= category === 'handwriting';
    }

    if (formData.get('display') === 'on') {
      criteria ||= category === 'display';
    }

    const query = formData.get('query');

    if (query) {
      const re = new RegExp(query, 'i');
      criteria &&= re.test(family);
    }

    return criteria;
  });
}

function createNewList(formData) {
  while (scrollableList.hasChildNodes()) {
    scrollableList.removeChild(scrollableList.firstElementChild);
  }

  filterFonts(formData);
  createdIndex = -1;

  if (fontList.length) {
    for (let i = 0; i < maxFirstCreationCount; i++) {
      const newListItem = document.createElement('li');
      newListItem.innerText = fontList[i].family;
      scrollableList.appendChild(newListItem);

      createdIndex += 1;
      console.log(fontList);
      console.log(createdIndex, fontList.length);
      console.log(createdIndex === fontList.length - 1);
      if (createdIndex === fontList.length - 1) {
        break;
      }
    }
  }
}

window.addEventListener('load', async () => {
  data = (await api.fetchFonts()).items;

  const filterForm = document.getElementById('filter-form');

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    createNewList(formData);
  });
});
