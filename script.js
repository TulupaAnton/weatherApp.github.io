const API_KEY = '1d0008fb5b5d15876b74b930fa7cd34d'
const BASE_URL = 'https://api.openweathermap.org/data/2.5/'
const ERROR_NOT_FOUND = '404'
const ICON_SIZE = '@4x.png'
const DAYS_OF_WEEK = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

// Функция для отображения кастомного алерта
function showAlert (title, text, icon = 'warning') {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: '#007BFF'
  })
}

// Функция для запроса текущей погоды
async function fetchWeather (city) {
  if (!city) {
    showAlert('Упс...', 'Будь ласка, введіть місто!', 'warning')
    return null
  }

  try {
    const response = await fetch(
      `${BASE_URL}weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=ua`
    )
    const data = await response.json()
    return data.cod === ERROR_NOT_FOUND ? null : data
  } catch (error) {
    console.error('Помилка отримання даних про погоду:', error)
    showAlert(
      'Помилка',
      'Не вдалося отримати дані про погоду. Спробуйте ще раз.',
      'error'
    )
    return null
  }
}

// Функция для запроса прогноза погоды
async function fetchForecast (city) {
  try {
    const response = await fetch(
      `${BASE_URL}forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=ua`
    )
    const data = await response.json()
    return data.list || []
  } catch (error) {
    console.error('Помилка отримання прогнозу погоди:', error)
    showAlert(
      'Помилка',
      'Не вдалося отримати прогноз погоди. Спробуйте ще раз.',
      'error'
    )
    return []
  }
}

// Основная функция для загрузки данных о погоде
async function getWeather () {
  const city = document.getElementById('city').value
  const weatherData = await fetchWeather(city)
  const forecastData = await fetchForecast(city)

  if (!weatherData) {
    showAlert(
      'Місто не знайдено',
      'Перевірте назву міста і спробуйте ще раз.',
      'info'
    )
    return
  }

  displayWeather(weatherData)
  displayDailyForecast(forecastData)
}

// Функция для отображения текущей погоды
function displayWeather (data) {
  const tempDiv = document.getElementById('temp-div')
  const weatherInfoDiv = document.getElementById('weather-info')
  const weatherIcon = document.getElementById('weather-icon')

  tempDiv.innerHTML = ''
  weatherInfoDiv.innerHTML = ''

  const cityName = data.name
  const temperature = Math.round(data.main.temp)
  const description = data.weather[0].description
  const iconCode = data.weather[0].icon
  const iconUrl = `http://openweathermap.org/img/wn/${iconCode}${ICON_SIZE}`

  weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`
  tempDiv.innerHTML = `<p>${temperature}°C</p>`
  weatherIcon.src = iconUrl
  weatherIcon.alt = description
  weatherIcon.style.display = 'block'
}

// Функция для отображения прогноза на несколько дней
function displayDailyForecast (forecastData) {
  const dailyForecastDiv = document.getElementById('daily-forecast')
  dailyForecastDiv.innerHTML = ''

  const dailyData = {}

  forecastData.forEach(item => {
    const date = item.dt_txt.split(' ')[0]
    if (!dailyData[date]) {
      dailyData[date] = {
        temp: [],
        icon: item.weather[0].icon,
        description: item.weather[0].description
      }
    }
    dailyData[date].temp.push(item.main.temp)
  })

  Object.keys(dailyData)
    .slice(0, 5)
    .forEach(date => {
      const avgTemp = Math.round(
        dailyData[date].temp.reduce((sum, t) => sum + t, 0) /
          dailyData[date].temp.length
      )
      const iconUrl = `http://openweathermap.org/img/wn/${dailyData[date].icon}.png`

      const dayIndex = new Date(date).getDay()
      const dailyItemHtml = `
        <div class="daily-item">
          <p>${DAYS_OF_WEEK[dayIndex]}</p>
          <img src="${iconUrl}" alt="Weather Icon">
          <p>${avgTemp}°C</p>
          <p>${dailyData[date].description}</p>
        </div>
      `
      dailyForecastDiv.innerHTML += dailyItemHtml
    })
}
