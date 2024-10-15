import json
import requests


def get_train_info(from_station, to_station, departure_date, ticket_type):
    raw_info = get_raw_info(from_station, to_station, departure_date, ticket_type)
    train_info = handle_raw_train_response(raw_info)
    return train_info


def get_raw_info(from_station, to_station, departure_date, ticket_type):
    url = "https://kyfw.12306.cn/otn/leftTicket/query"
    params = {
        "leftTicketDTO.train_date": departure_date,  # 出发日期
        "leftTicketDTO.from_station": trans_city_name(from_station),  # 出发站 (上海虹桥)
        "leftTicketDTO.to_station": trans_city_name(to_station),  # 到达站 (北京北)
        "purpose_codes": ticket_type  # 乘车类型 (成人)
    }

    # 请求头，包括所有详细信息
    headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Cookie": "_uab_collina=171315661073830582305314; JSESSIONID=877B03482DA66F37A0619846F5EB0E23; _jc_save_wfdc_flag=dc; _jc_save_toStation=%u5317%u4EAC%2CBJP; _jc_save_fromStation=%u4E0A%u6D77%2CSHH; BIGipServerpool_passport=182714890.50215.0000; BIGipServerpassport=904397066.50215.0000; guidesStatus=off; highContrastMode=defaltMode; cursorStatus=off; route=6f50b51faa11b987e576cdb301e545c4; BIGipServerotn=2547450122.24610.0000; _jc_save_fromDate=2024-10-13; _jc_save_toDate=2024-10-13",
        "Host": "kyfw.12306.cn",
        "If-Modified-Since": "0",
        "Referer": "https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=%E4%B8%8A%E6%B5%B7,SHH&ts=%E5%8C%97%E4%BA%AC,BJP&date=2024-10-13&flag=N,N,Y",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
        "X-Requested-With": "XMLHttpRequest"
    }

    response = requests.get(url, headers=headers, params=params)
    return response.json()


def handle_raw_train_response(raw):
    result = raw.get("data").get("result")
    train_info = {}
    for train in result:
        info = train.split("|")

        train_id = info[3]
        start_station = info[4]
        end_station = info[5]
        from_station = info[6]
        to_station = info[7]
        departure = info[8]
        arrival = info[9]
        last = info[10]

        super_first_class = info[20]
        soft_sleeper = info[23]
        no_seat = info[26]
        hard_sleeper = info[28]
        hard_seat = info[29]
        second_class = info[30]
        first_class = info[31]
        business = info[32]

        price_infos = info[39]

        # 根据首字母解析价格
        def parse_price_info(price_infos):
            seat_prices = {}
            for i in range(int(len(price_infos) / 10)):
                price_info = price_infos[10 * i:10 * (i + 1)]
                seat_type_prefix = price_info[0]
                price = int(price_info[1:5]) + int(price_info[5]) / 10  # 提取四位数字的票价

                # 根据首字母判断座位类型
                if seat_type_prefix == '9':
                    seat_prices["商务座"] = price
                elif seat_type_prefix == 'M':
                    seat_prices["一等座"] = price
                elif seat_type_prefix == 'O' or seat_type_prefix == "1":
                    # O 可以表示无座、硬座或二等座
                    seat_prices["无座"] = price
                    seat_prices["硬座"] = price
                    seat_prices["二等座"] = price
                elif seat_type_prefix == 'I' or seat_type_prefix == "4":
                    seat_prices["软卧"] = price
                elif seat_type_prefix == 'J' or seat_type_prefix == "3":
                    seat_prices["硬卧"] = price
                elif seat_type_prefix == 'D':
                    seat_prices["优选一等座"] = price

            return seat_prices

        # 提取票价
        seat_prices = parse_price_info(price_infos)

        # 创建 seats_info 字典
        seats_info = {}

        # 判断余票是否为空并填充 seats_info 字段
        if business and business != "":
            seats_info["商务座"] = {
                "remain": business,
                "price": seat_prices.get("商务座")
            }

        if first_class and first_class != "":
            seats_info["一等座"] = {
                "remain": first_class,
                "price": seat_prices.get("一等座")
            }

        if second_class and second_class != "":
            seats_info["二等座"] = {
                "remain": second_class,
                "price": seat_prices.get("二等座")
            }

        if super_first_class and super_first_class != "":
            seats_info["优选一等座"] = {
                "remain": super_first_class,
                "price": seat_prices.get("优选一等座")
            }

        if soft_sleeper and soft_sleeper != "":
            seats_info["软卧"] = {
                "remain": soft_sleeper,
                "price": seat_prices.get("软卧")
            }

        if hard_sleeper and hard_sleeper != "":
            seats_info["硬卧"] = {
                "remain": hard_sleeper,
                "price": seat_prices.get("硬卧")
            }

        if hard_seat and hard_seat != "":
            seats_info["硬座"] = {
                "remain": hard_seat,
                "price": seat_prices.get("硬座")
            }

        if no_seat and no_seat != "":
            seats_info["无座"] = {
                "remain": no_seat,
                "price": seat_prices.get("无座")
            }

        # 构建 train_info 字典
        train_info[train_id] = {
            "begin": trans_city_name_back(start_station),
            "end": trans_city_name_back(end_station),
            "from": trans_city_name_back(from_station),
            "to": trans_city_name_back(to_station),
            "departure": departure,
            "arrival": arrival,
            "last": last,
            "seats_info": seats_info
        }

    return train_info


def trans_city_name(city_name):
    with open("resource/city_name.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get(city_name)


# 将缩写转换为汉字
def trans_city_name_back(city_short):
    with open("resource/city_name.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        # 反向查找缩写对应的城市名
        for city, short in data.items():
            if short == city_short:
                return city
        return None  # 如果找不到返回 None
