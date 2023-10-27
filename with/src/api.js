async function fetchFonts() {
  try {
    const endpoint = 'https://www.googleapis.com/webfonts/v1/webfonts';
    const key = 'AIzaSyB2ImDRIBOZotD8eXtVDh3vr32IejoMvb0';
    const sort = 'popularity';
    const response = await fetch(`${endpoint}?key=${key}&sort=${sort}`);

    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export default { fetchFonts };
