import json
import requests


def get_hotels_info(country, checkInDate, checkOutDate, adultNum, childNum, roomNum, pageIndex):
    raw_info = get_raw_hotels_info(country, checkInDate, checkOutDate, adultNum, childNum, roomNum, pageIndex)
    hotels_info = handle_raw_hotels_info(raw_info)
    full_hotels_info = get_hotels_price_info(hotels_info, checkInDate, checkOutDate, adultNum, roomNum)
    return full_hotels_info


def get_raw_hotels_info(country, checkInDate, checkOutDate, adultNum, childNum, roomNum, pageIndex):
    url = "https://api.tripadvisor.cn/restapi/soa2/20874/hotelListForPc"

    # 定义请求负载（JSON 数据）
    payload = {
        "geoId": get_geo_id(country),
        "sort": "RANK",
        "checkInDate": checkInDate,
        "checkOutDate": checkOutDate,
        "adultNum": adultNum,
        "childNum": childNum,
        "roomNum": roomNum,
        "needFilters": True,
        "pageIndex": pageIndex,
        "pageSize": 30,
        "nearbyLocationId": "",
        "filters": [
            {"type": "price", "param": ""},
            {"type": "facility", "param": ""},
            {"type": "lv", "param": ""},
            {"type": "spec", "param": ""},
            {"type": "style", "param": ""},
            {"type": "type", "param": ""},
            {"type": "rating", "param": ""},
            {"type": "brand", "param": ""},
            {"type": "zone", "param": ""},
            {"type": "distance", "param": ""}
        ],
        "distanceSelectName": "",
        "childList": []
    }

    # 定义请求头
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # 发送 POST 请求
    response = requests.post(url, json=payload, headers=headers)

    return response.json().get("hotels")


def get_geo_id(country):
    url = "https://api.tripadvisor.cn/restapi/soa2/21221/suggestedSearch"

    payload = {
        "keywords": country,
        "pageNo": 1,
        "pageSize": 3
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    response = requests.post(url, json=payload, headers=headers)
    result = response.json()

    hits = result.get("result").get("hits")
    geoId = hits[0].get("taGeoId")
    return geoId


def handle_raw_hotels_info(raw_info) -> dict:
    hotels_dict = {}

    for hotel in raw_info:
        hotel_id = hotel.get('hotelId')
        if not hotel_id:
            continue  # 如果没有 hotelId，跳过此酒店

        # 提取酒店的各类信息
        hotel_name = hotel.get('name')
        hotel_en_name = hotel.get('enName')
        latitude = hotel.get('latitude')
        longitude = hotel.get('longitude')
        ranking = hotel.get('ranking')
        review_rating = hotel.get('reviewRating')
        review_count = hotel.get('reviewCount')

        # 提取酒店图片（medium）
        cover_images = hotel.get('coverImages', [])
        medium_image_url = None
        if cover_images:
            medium_image_url = cover_images[0]['images'].get('medium', {}).get('url')

        # 提取酒店设施
        facilities = [tag['name'] for tag in hotel.get('tags', [])]

        # 提取酒店奖项
        awards = [award['title'] for award in hotel.get('awards', [])]

        # 构建酒店信息字典
        hotels_dict[hotel_id] = {
            'hotel_name': hotel_name,
            'hotel_en_name': hotel_en_name,
            'latitude': latitude,
            'longitude': longitude,
            'ranking': ranking,
            'review_rating': review_rating,
            'review_count': review_count,
            'medium_image_url': medium_image_url,
            'facilities': facilities,
            'awards': awards
        }

    return hotels_dict


def get_hotels_price_info(hotels_info, checkInDate, checkOutDate, adultNum, roomNum):
    hotel_ids = [hotel_id for hotel_id in hotels_info.keys()]

    url_price = "https://api.tripadvisor.cn/restapi/soa2/20874/cpcPrice"

    payload = {
        "checkIn": checkInDate,
        "checkOut": checkOutDate,
        "currency": "CNY",
        "numAdults": adultNum,
        "numRooms": roomNum,
        "locationIds": hotel_ids
    }

    # 设置请求头
    headers = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-length": str(len(str(payload))),
        "content-type": "application/json;charset=utf-8;",
        "origin": "https://www.tripadvisor.cn",
        "priority": "u=1, i",
        "referer": "https://www.tripadvisor.cn/",
        "sec-ch-ua": '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
        "x-ta-uid": "09031055116350523067"  # 这个是从浏览器获取的
    }

    response = requests.post(url_price, json=payload, headers=headers)

    # 如果请求成功，解析响应
    if response.status_code == 200:
        price_data = response.json()

        # 遍历每个酒店的价格信息
        for hotel_price_info in price_data.get('hotelPrices', []):
            hotel_id = hotel_price_info.get('hotelId')
            cpc_prices = hotel_price_info.get('cpcPrices', [])

            # 初始化 prices 列表
            prices = []

            # 遍历每个价格选项并提取需要的信息
            for price_option in cpc_prices:
                availability = price_option.get('availability')
                display_name = price_option.get('displayName')
                display_price = price_option.get('displayPrice')
                booking_label = price_option.get('bookingLabel', [])

                # 构建每个价格信息字典
                price_info = {
                    "availability": availability,
                    "displayName": display_name,
                    "displayPrice": display_price,
                    "bookingLabel": booking_label
                }

                # 添加到 prices 列表中
                prices.append(price_info)

            # 将价格信息加入到 hotels_info 中对应的 hotel_id 下
            if hotel_id in hotels_info:
                hotels_info[hotel_id]["prices"] = prices

    return hotels_info


if __name__ == "__main__":
    get_hotels_info("北京", "2024-10-06", "2024-10-07", 2, 0, 1, 1)