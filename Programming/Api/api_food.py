import requests
from Api.api_hotels import get_geo_id


def get_food_info(country, page):
    raw_infos = get_raw_food_data(country, page)
    food_info = handle_raw_food_data(raw_infos)

    return food_info


def get_raw_food_data(country, page):
    url = "https://api.tripadvisor.cn/restapi/soa2/21218/restaurantListForPc"

    payload = {
        "filters": [
            {
                "type": "restanrantlType",
                "param": ""
            },
            {
                "type": "mealType",
                "param": ""
            },
            {
                "type": "priceTag",
                "param": ""
            },
            {
                "type": "cuisine",
                "param": ""
            },
            {
                "type": "dish",
                "param": ""
            },
            {
                "type": "dietaryRestriction",
                "param": ""
            },
            {
                "type": "restanrantStyle",
                "param": ""
            },
            {
                "type": "diningOption",
                "param": ""
            },
            {
                "type": "neighborhood",
                "param": ""
            },
            {
                "type": "airport",
                "param": ""
            }
        ],
        "geoId": get_geo_id(country),
        "nearyByLocationId": None,
        "latitude": "39.909336",
        "longitude": "116.39452",
        "needFilters": True,
        "pageIndex": page,
        "pageSize": 30,
        "sort": "RANK"
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # 发送 POST 请求
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    result = data.get("masterRestaurants").get("restaurants")

    return result


def handle_raw_food_data(raw_data):
    processed_info = {}
    for restaurant in raw_data:
        restaurant_id = restaurant.get('restaurantId')
        if not restaurant_id:
            # 如果没有 restaurantId，则跳过该条数据
            continue

        # 提取关键信息，处理可能的缺失数据
        name = restaurant.get('name', '未知名称')

        # 将 commentRating 转换为 float 类型，如果无法转换则设为 0.0
        try:
            rating = float(restaurant.get('commentRating', 0))
        except (ValueError, TypeError):
            rating = 0.0

        review_count = restaurant.get('commentCount', 0)

        # 提取菜系名称列表
        cuisines = restaurant.get('cuisines', [])
        cuisine_names = [cuisine.get('name') for cuisine in cuisines if cuisine.get('name')]

        price = restaurant.get('price', '价格未标明')

        # 提取封面图片 URL
        cover_image = restaurant.get('coverImage', {})
        images = cover_image.get('images', {})
        cover_image_url = ''
        if images:
            large_image = images.get('large', {})
            cover_image_url = large_image.get('url', '') if large_image else ''

        # 提取评论标题列表
        reviews = restaurant.get('reviews', [])
        review_titles = [review.get('title') for review in reviews if review.get('title')]

        # 提取 URL
        url = restaurant.get('url', 'URL未提供')

        # 组织数据
        processed_info[restaurant_id] = {
            'name': name,
            'rating': rating,
            'review_count': review_count,
            'cuisines': cuisine_names,
            'price': price,
            'cover_image_url': cover_image_url,
            'reviews': review_titles,
            'url': url
        }

    return processed_info


if __name__ == "__main__":
    get_food_info("重庆", 2)