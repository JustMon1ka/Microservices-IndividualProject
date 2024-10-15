from flask import Flask, request, jsonify
from flask_cors import CORS
from Api.api_12306 import get_train_info
from Api.api_hotels import get_hotels_info
from Api.api_weather import get_weather_info
from Api.api_sights import get_sights_info
from Api.api_food import get_food_info
import os


# # 清除 HTTP 和 HTTPS 代理环境变量
# os.environ.pop('http_proxy', None)
# os.environ.pop('https_proxy', None)


app = Flask(__name__)
CORS(app)  # 允许跨域请求


@app.route("/get_trains", methods=['GET'])
def get_train():
    from_station = request.args.get('from_station')
    to_station = request.args.get('to_station')
    departure_date = request.args.get('departure')
    ticket_type = "ADULT"

    train_info = get_train_info(from_station, to_station, departure_date, ticket_type)

    return jsonify({'trains': train_info})


@app.route("/get_hotels", methods=['GET'])
def get_hotel():
    country = request.args.get('country')
    checkInDate = request.args.get('checkInDate')
    checkOutDate = request.args.get('checkOutDate')
    adultNum = int(request.args.get('adultNum', 1))  # 设置默认值为1
    childNum = int(request.args.get('childNum', 0))  # 设置默认值为0
    roomNum = int(request.args.get('roomNum', 1))    # 设置默认值为1
    pageIndex = int(request.args.get('pageIndex', 1))  # 设置默认值为1

    hotel_info = get_hotels_info(country, checkInDate, checkOutDate, adultNum, childNum, roomNum, pageIndex)

    return jsonify({"hotels": hotel_info})


@app.route("/get_weather", methods=['GET'])
def get_weather():
    country = request.args.get('country')
    weather_info = get_weather_info(country)

    return jsonify({"weather": weather_info})


@app.route("/get_sights", methods=['GET'])
def get_sights():
    country = request.args.get('country')
    pageIndex = int(request.args.get('pageIndex', 1))

    sights_info = get_sights_info(country, pageIndex)

    return jsonify({"sights": sights_info})


@app.route("/get_food", methods=['GET'])
def get_food():
    country = request.args.get('country')
    pageIndex = int(request.args.get('pageIndex', 1))

    food_info = get_food_info(country, pageIndex)

    return jsonify({"food": food_info})


if __name__ == "__main__":
    app.run("0.0.0.0", port=9999)