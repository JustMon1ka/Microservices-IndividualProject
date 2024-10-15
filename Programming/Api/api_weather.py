import requests
key = "2eb8e1683f8b48779ed2073af2011505"


def get_weather_info(city):
    raw_info = get_raw_7d_weather(city)
    weather_7d = handle_raw_7d_weather(raw_info)
    raw_info = get_raw_24h_weather(city)
    weather_24h = handle_raw_24h_weather(raw_info)

    return {
        "weather_7d": weather_7d,
        "weather_24h": weather_24h
    }


def get_raw_7d_weather(city):
    url = "https://devapi.qweather.com/v7/weather/7d"

    params = {
        "location": get_city_geo_info(city),
        "key": key,
        "lang": "zh"
    }

    res = requests.get(url, params=params)
    return res.json()


def get_raw_24h_weather(city):
    url = "https://devapi.qweather.com/v7/weather/24h"

    params = {
        "location": get_city_geo_info(city),
        "key": key,
        "lang": "zh"
    }

    res = requests.get(url, params=params)
    return res.json().get("hourly")


def handle_raw_24h_weather(raw_info):
    result = {}
    for weather in raw_info:
        time = weather.get("fxTime")
        temp = weather.get("temp")
        text = weather.get("text")

        result[time] = {
            "temp": temp,
            "text": text
        }

    return result


def handle_raw_7d_weather(raw_info):
    result = {}
    infos = raw_info.get("daily")
    for weather in infos:
        date = weather.get("fxDate")
        sunrise = weather.get("sunrise")
        sunset = weather.get("sunset")
        tempMax = weather.get("tempMax")
        tempMin = weather.get("tempMin")
        textDay = weather.get("textDay")
        textNight = weather.get("textNight")

        result[date] = {
            "sunrise": sunrise,
            "sunset": sunset,
            "tempMax": tempMax,
            "tempMin": tempMin,
            "textDay": textDay,
            "textNight": textNight
        }

    return result


def get_city_geo_info(city):
    url = "https://geoapi.qweather.com/v2/city/lookup"

    params = {
        "location": city,
        "key": key,
        "number": 1
    }

    res = requests.get(url, params=params).json()
    return res.get("location")[0].get("id")


if __name__ == "__main__":
    get_weather_info("上海")