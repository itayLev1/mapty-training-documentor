'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


/////// using the geolocation API \\\\\\\ 

class Workout {
  // variables
  date = new Date();
  id = (Date.now() + '').slice(-10);
  // constructor
  constructor(coords, distance, duration) {
    this.coords = coords // [lat, lng]
    this.distance = distance // in km
    this.duration = duration // in min
  }

  // methods

}

class Running extends Workout {
  // variables
  type = 'running'
  // constructor
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration)
    this.cadence = cadence
    this.pace = this.calcPace()
  }

  // methods
  calcPace(duration, distance) {
    // min/km
    this.pace = this.duration / this.distance
    return this.pace
  }
}


class Cycling extends Workout {
  // variables
  type = 'cycling'
  // constructor
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration)
    this.elevationGain = elevationGain
    this.speed = this.calcSpeed()
    console.log(this.speed);
  }

  // methods 
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60)
    return this.speed
  }
}


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

                //** Application Architecture **\\ 
class App {
  // class variables declarations
  #map;
  #mapEvent;
  #workouts = []
  // constructor function ("onload")
  constructor() {

    this._getPosition()

    form.addEventListener('submit', this._newWorkout.bind(this))

    inputType.addEventListener('change', this._toggleElevationField)
  }

  // Methods
  _getPosition() {
    // getting coordinate for current position
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
        // First parameter of getCurrentPosition - execute function

        // Second parameter of getCurrentPosition - error handling function
        function () {
          alert('Could not get your position')
        }
      )
  }

  _loadMap(position) {
    const { latitude } = position.coords
    const { longitude } = position.coords

    /////// using leaflet library \\\\\\
    // displaying the map
    const coords = [latitude, longitude]
    // create the #map object setting the default view onload (location, zoom)
    this.#map = L.map('map').setView(coords, 3);
    // setting the map theme and adding it to the #map object
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(this.#map);

    // displaying the event marker
    L.marker(coords).addTo(this.#map)
      .bindPopup('Welcome !')
      .openPopup();

    // Handling clicks on map with leaflet library method (.on)
    this.#map.on('click', this._showForm.bind(this))
  }


  // display the form when clicking on the map
  _showForm(mapE) {
    this.#mapEvent = mapE
    form.classList.remove('hidden')
    inputDistance.focus()
  }

  _toggleElevationField() {
    // Toggle running/cycling in the type field in the form
    inputElevation.closest('.form__row')
      .classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row')
      .classList.toggle('form__row--hidden')
  }

  _newWorkout(e) {
    const validInput = (...inputs) => inputs.every(input => Number.isFinite(input))
    const allPositive = (...inputs) => inputs.every(input => input > 0)

    e.preventDefault()

    // get data from the from
    const type = inputType.value
    const distance = +inputDistance.value
    const duration = +inputDuration.value
    const { lat, lng } = this.#mapEvent.latlng
    let workout

    // if workout is running, create a new running object
    if (type === 'running') {
      const cadence = +inputCadence.value
      // check if data is valid
      if (
        //  !Number.isFinite(distance) ||
        //  !Number.isFinite(duration) ||
        //  !Number.isFinite(cadence)
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers')

        workout = new Running([lat, lng],
          distance, duration, cadence)
    }

    // if workout is cycling, create a new cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value

      // check if data is valid
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers')

        workout = new Cycling([lat, lng], distance, duration, elevation)
      }
      
      // add new object to workouts array
      this.#workouts.push(workout)
      console.log(this.#workouts);

    // render workout on the map (as a marker)
      this.renderWorkoutMarker(workout)

    // render workout on the list 


    // hide the form  + clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
  }))
  .setPopupContent(`${workout.speed}`)
  .openPopup();
  };
};



const app = new App();
/*
// getting coordinate for current position
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    // First parameter of getCurrentPosition - execute function
    function (position) {
      const { latitude } = position.coords
      const { longitude } = position.coords
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      /////// using leaflet library \\\\\\
      // displaying the map
      const coords = [latitude, longitude]
      const markerCooords = []
      map = L.map('map').setView(coords, 3);
      console.log(map);

      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }).addTo(map);

      L.marker(coords).addTo(map)
        .bindPopup('Welcome !')
        .openPopup();

      map.on('click', function (mapE) {
        mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()
      })
    },
    // Second parameter of getCurrentPosition - error handling function
    function () {
      alert('Could not get your position')
    })

*/