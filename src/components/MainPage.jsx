import { IoIosSearch } from "react-icons/io";
import { icons, bgImages, regions } from "../data";
import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { format } from "date-fns";

function MainPage() {
  const [weatherDetails, setWeatherDetails] = useState({});
  const [currentCity, setCurrentCity] = useState("");
  const enteredCity = useRef();
  const [timezone, setTimeZone] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const fetchCountry = async function (city) {
        const byCoords = `lat=${latitude}&lon=${longitude}`;
        const byCityName = `q=${city}`;
        const param = city ? byCityName : byCoords;

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?${param}&appid=aa47bc4dd6faa742921b4d33fa26596d&units=metric`
        );
        const data = await response.json();
        // console.log(data)
        const obj = {
          city: data.name,
          temp: Math.round(data.main.temp),
          feels: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind: data.wind.speed,
          weather: data.weather[0].main,
          timezone: data.timezone,
        };
        setWeatherDetails(obj);
        setIsLoading(false);
      };
      fetchCountry(currentCity);
    });
  }, [currentCity]);

  useEffect(() => {
    const calcTime = function (offset) {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const curDate = new Date(utc + 1000 * offset);
      setTimeZone(curDate);
    };
    weatherDetails.timezone && calcTime(weatherDetails.timezone);
  }, [weatherDetails]);

  let bgImage;
  const dayTime = format(timezone, "HH");
  const dateTime = format(timezone, "HH:mm - EEEE MMM d");

  if (dayTime >= 6 && dayTime < 18) {
    bgImage = bgImages.day[weatherDetails.weather];
  } else {
    bgImage = bgImages.night[weatherDetails.weather];
  }

  function selectRegion(region) {
    setCurrentCity(region);
  }

  function submitHandler(e) {
    e.preventDefault();
    setCurrentCity(enteredCity.current.value);

    enteredCity.current.value = "";
  }

  if (isLoading) {
    return <p className="loader"></p>;
  }

  return (
    <div className="weather-app" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="container">
        <h3>the weather</h3>
        <div>
          <h1>{weatherDetails.temp} °C</h1>
          <div className="city-time">
            <h1>{weatherDetails.city}</h1>
            <small>
              <span>{dateTime}</span>
            </small>
          </div>
          <div className="weather">
            <img
              src={icons[weatherDetails.weather]}
              alt="icon"
              width={75}
              height={75}
            />
            <span>{weatherDetails.weather}</span>
          </div>
        </div>
      </div>
      {/* PANEL */}
      <div className="panel">
        <form onSubmit={submitHandler}>
          <input ref={enteredCity} type="text" placeholder="enter the city" />
          <button type="submit">
            <IoIosSearch />
          </button>
        </form>
        <ul>
          {regions.map((region) => (
            <li
              key={nanoid()}
              onClick={() => selectRegion(region)}
              className="city"
            >
              {region}
            </li>
          ))}
        </ul>
        <ul>
          <h4>Weather details</h4>
          <li>
            <span>Pressure</span>
            <span>{weatherDetails.pressure} Pa</span>
          </li>
          <li>
            <span>Humidity</span>
            <span>{weatherDetails.humidity} %</span>
          </li>
          <li>
            <span>Wind</span>
            <span>{weatherDetails.wind} km/h</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MainPage;
