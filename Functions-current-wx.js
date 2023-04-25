// This example shows how to make a decentralized temperature report using multiple APIs

// Arguments can be provided when a request is initated on-chain and used in the request source code as shown below
const lat = args[0]
const long = args[1]
let accuWeatherWeatherResponse

if (secrets.openWXKey == "" || secrets.accuWXKey == "" || secrets.tommIOKey == "") {
  throw Error("You are missing one or more weather API keys.")
}

// Use multiple APIs & aggregate the results to enhance decentralization
const openWeatherRequest = Functions.makeHttpRequest({
  url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${secrets.openWXKey}`,
})
const accuWeatherLocationRequest = Functions.makeHttpRequest({
  url: `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${secrets.accuWXKey}&q=${lat},${long}`,
})
const tomorrowIOWeatherRequest = Functions.makeHttpRequest({
  url: `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${long}&apikey=${secrets.tommIOKey}`,
})

// First, execute all the API requests are executed concurrently, then wait for the responses
const [openWeatherResponse, accuWeatherLocationResponse, tomorrowIOWeatherResponse] = await Promise.all([
  openWeatherRequest,
  accuWeatherLocationRequest,
  tomorrowIOWeatherRequest,
])

//Used the returned Accuweather location id to request the temperature
if (!accuWeatherLocationResponse.error) {
  const accuWeatherWeatherRequest = Functions.makeHttpRequest({
    url: `http://dataservice.accuweather.com/currentconditions/v1/${accuWeatherLocationResponse.data.Key}?apikey=${secrets.accuWXKey}`,
  })
  accuWeatherWeatherResponse = await accuWeatherWeatherRequest
  console.log(`AccuWeather Reported Temperature ${accuWeatherWeatherResponse.data[0].Temperature.Metric.Value}`)
}
console.log(`OpenWeather Reported Temperature ${openWeatherResponse.data.main.temp - 273.15}`)
console.log(`TomorrowIO Reported Temperature ${tomorrowIOWeatherResponse.data.data.values.temperature}`)

const temperatures = []

if (!openWeatherResponse.error) {
  temperatures.push(openWeatherResponse.data.main.temp - 273.15)
} else {
  console.log("OpenWeather Error")
}
if (!accuWeatherWeatherResponse.error && !accuWeatherLocationResponse.error) {
  temperatures.push(accuWeatherWeatherResponse.data[0].Temperature.Metric.Value)
} else {
  console.log("AccuWeather Error")
}
if (!tomorrowIOWeatherResponse.error) {
  temperatures.push(tomorrowIOWeatherResponse.data.data.values.temperature)
} else {
  console.log("TomorrowIO Error")
}

// At least 3 termperatures are needed to aggregate the median temp
if (temperatures.length < 3) {
  // If an error is thrown, it will be returned back to the smart contract
  throw Error("More than 1 API failed")
}

const medianTemperature = temperatures.sort((a, b) => a - b)[Math.floor(temperatures.length / 2)]
console.log(`Median Termperature: ${medianTemperature.toFixed(2)}`)
return Functions.encodeUint256(Math.round(medianTemperature * 100))
