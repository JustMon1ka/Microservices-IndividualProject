import requests
from Api.api_hotels import get_geo_id


def get_sights_info(country, page):
    raw_info = get_raw_sights_info(country, page)
    sights_infos = handle_raw_data(raw_info)
    return sights_infos


def get_raw_sights_info(country, page):
    url = "https://api.tripadvisor.cn/restapi/soa2/20405/getPCSightList"

    payload = {
        "geoId": get_geo_id(country),
        "pageIndex": page,
        "pageSize": 30,
        "travelRanking": False,
        "needSelectedFilters": True,
        "filters": [
            {
                "type": "subcategory",
                "param": ""
            },
            {
                "type": "subtype",
                "param": ""
            },
            {
                "type": "neighborhood",
                "param": ""
            },
            {
                "type": "travelerRating",
                "param": ""
            },
            {
                "type": "awards",
                "param": ""
            },
            {
                "type": "waypointairport",
                "param": ""
            },
            {
                "type": "waypointstation",
                "param": ""
            },
            {
                "type": "other",
                "param": ""
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # 发送 POST 请求
    response = requests.post(url, json=payload, headers=headers)

    return response.json().get("verticalData")


def handle_raw_data(raw_infos: list[dict]) -> dict:
    """
    处理原始API返回的景点数据，提取关键信息并整理成字典格式。

    Args:
        raw_infos (list[dict]): 原始API返回的景点数据列表。

    Returns:
        dict: 以taSightId为键的景点信息字典。
    """
    processed_data = {}
    for item in raw_infos:
        ta_sight_id = item.get('taSightId') or item.get('jvId')
        if not ta_sight_id:
            continue  # 如果没有ID则跳过该条数据

        # 提取标签名称
        tags = [tag.get('displayName') for tag in item.get('tags', []) if tag.get('displayName')]
        tags_desc = item.get('tagsDesc', '')

        # 提取评分
        ranking_data = item.get('rankingData', {})
        rating = ranking_data.get('rating', None)

        # 构建简化后的景点信息
        processed_data[ta_sight_id] = {
            'name': item.get('displayName'),
            'english_name': item.get('displayEnName'),
            'location': {
                'latitude': item.get('latitude'),
                'longitude': item.get('longitude'),
                'geoId': item.get('geoId')
            },
            'reviews': {
                'count': item.get('reviewsCount'),
                'count_string': item.get('reviewsCountString')
            },
            'tags': {
                'description': tags_desc,
                'details': tags
            },
            'cover_image': {
                'url': item.get('coverImage', {}).get('url'),
                'width': item.get('coverImage', {}).get('width'),
                'height': item.get('coverImage', {}).get('height')
            },
            'rating': rating,
            'url': item.get('url')
        }

    return processed_data


if __name__ == "__main__":
    get_sights_info("重庆", 2)