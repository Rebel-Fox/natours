export const displayMap = (locations) => {
  const map = L.map('map',{zoomControl : false,scrollWheelZoom : false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const points = locations.map(location => {
    const coordinates = [location.coordinates[1],location.coordinates[0]];
    L.marker(coordinates).addTo(map);
    return coordinates;
  })

  map.fitBounds(L.latLngBounds(points),{padding : [50,50]});
}