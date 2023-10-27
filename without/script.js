import api from './api.js';

const cssEndpoint = 'https://fonts.googleapis.com/css?family=';

function loadFonts(fonts) {
  const container = document.getElementById('infinite-scroll');
  fonts.forEach((font) => {
    const newFont = document.createElement('div');
    newFont.innerText = font.family;
    newFont.style.fontFamily = `${font.family}, ${font.category}`;
    container.appendChild(newFont);
  });

  const fontFamilies = fonts.map((font) => font.family);

  const cssUrl = `${cssEndpoint}${fontFamilies.join('|')}`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  document.querySelector('head').appendChild(link);
}

window.addEventListener('load', async () => {
  const { items: fonts } = await api.fetchFonts();

  loadFonts(fonts.slice(0, 50));
});
