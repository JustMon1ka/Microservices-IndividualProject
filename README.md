# 国内旅游出行小帮手应用 - 项目报告

## 首页导航

- [项目描述](#项目描述)
- [项目需求](#项目需求)
- [技术栈](#技术栈)
    - [前端技术栈](#前端技术栈)
    - [后端技术栈](#后端技术栈)
- [项目目标](#项目目标)
- [功能模块及其实现](#功能模块)
    - [信息查询模块实现](#信息查询模块)
    - [行程规划模块实现](#行程规划模块)
- [项目成果](#项目成果)
- [API 调用](#api-调用)
    - [火车班次 API](#火车班次-api)
    - [酒店查询 API](#酒店查询-api)
    - [天气查询 API](#天气查询-api)
    - [景点查询 API](#景点查询-api)
    - [美食查询 API](#美食查询-api)
    - [地理信息 API](#地理信息-api)
- [参考文档](#参考文档)


## 项目描述

国内旅游出行小帮手应用是一款基于 Python、HTML、CSS 和 JavaScript 开发的跨平台网页应用。该应用集成了多个 Web API，旨在提供全面、便捷的国内旅游信息和行程规划工具，帮助用户轻松安排和管理旅行行程。

## 项目需求

### 主要功能概述
- **火车班次查询**：实时查询全国火车班次、余票和票价信息，并提供购票直达链接。
- **酒店信息查询**：比较目的地的酒店信息，包括价格、位置、用户评价，并提供酒店预订链接。
- **天气预报**：显示实时天气和未来的天气趋势，帮助用户合理安排行程。
- **景点推荐**：根据目的地推荐热门景点，提供地图定位和详细介绍。
- **美食指南**：推荐当地餐厅和特色美食，显示菜单、价格、用户评价，并支持导航功能。

## 技术栈

### 前端技术栈

1. **网页运行逻辑**：
    - **页面结构**：
        - 项目主页面通过 `www/welcome/index.html` 加载，用户在此输入出发地、目的地和出发时间。输入信息后，通过表单提交（由 JavaScript 处理），页面会跳转到火车班次选择页面 `select_departure_train/index.html`，并将用户输入的参数通过 URL 传递。
        - 各功能模块（如火车班次查询、酒店选择、景点推荐、美食推荐等）在用户提交相关信息后动态加载相应的数据，并展示在各自页面中。

    - **表单与页面跳转**：
        - 每个页面的表单提交后，使用 JavaScript 的 `window.location.href` 实现跳转，并将用户的输入值传递给下一个页面。例如，用户在 `welcome/index.html` 填写信息后，会跳转到火车班次选择页面，并将出发地、目的地、出发日期等信息传递到页面 URL 中：
          ```javascript
          document.getElementById('travel-form').addEventListener('submit', function(event) {
              event.preventDefault();  // 防止表单默认提交行为
              const fromStation = document.getElementById('from_station').value;
              const toStation = document.getElementById('to_station').value;
              const departureDate = document.getElementById('departure').value;
              window.location.href = `../select_departure_train/index.html?from_station=${fromStation}&to_station=${toStation}&departure=${departureDate}`;
          });
          ```

    - **动态数据加载与交互**：
        - 页面通过 **JavaScript** 使用 `fetch` API 异步向后端发送请求，并根据返回的数据动态更新页面内容。例如，在火车班次查询页面 `select_departure_train/index.html` 中，JavaScript 会发送请求获取所有符合条件的火车班次，用户可以在页面上查看所有车次信息。
        - 在用户提交信息后，JavaScript 通过解析 URL 参数，将输入的信息传递给相应的 API，并通过 DOM 操作将返回的数据渲染在页面中。

2. **使用到的前端库和资源**：
    - **和风天气图标库**：
        - 用于展示天气预报图标，借助和风天气提供的图标字体库，前端能直观显示不同的天气信息。以下代码在页面中引入了该图标库：
      ```html
      <link
         rel="stylesheet"
         href="https://cdn.jsdelivr.net/npm/qweather-icons@1.3.0/font/qweather-icons.css"
         crossorigin="anonymous"
         referrerpolicy="no-referrer"
      />
      ```

    - **百度地图 API**：
        - 在景点推荐和美食推荐页面，通过百度地图 API 为用户提供地理位置信息的可视化功能。该 API 能够根据用户的当前位置或选择的景点显示地图，帮助用户查看周边设施或规划路线。
      ```html
      <script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=Ix29D1qo8ztHgbWrSxvYXquhxucQGazN"></script>
      ```

    - **本地存储**：
        - 前端使用了 **LocalStorage** 存储用户的输入信息，如出发地和目的地。通过这种方式，用户无需反复输入相同信息，提升了用户体验。

3. **页面模块划分**：
    - **欢迎页面** (`www/welcome/index.html`)：用户进入应用后首先加载的页面，输入出发地、目的地和出发日期。提交表单后，页面跳转至火车班次查询模块。
    - **火车班次查询模块** (`www/select_departure_train/index.html`)：通过与 12306 API 的交互，显示用户选择的出发地和目的地的所有火车班次，包括车次号、出发时间和票价信息。
    - **酒店选择模块** (`www/make_plan/select_hotel/select_hotel/index.html`)：用户可以选择目的地的酒店，并查看详细的酒店信息。JavaScript 负责调用 Tripadvisor API 获取酒店列表。
    - **景点推荐模块** (`www/make_plan/select_sights/show_sights/index.html`)：展示用户目的地的热门景点，通过 Tripadvisor API 获取景点信息。
    - **美食推荐模块** (`www/make_plan/select_food/show_food/index.html`)：展示用户目的地的美食和餐厅推荐。

4. **响应式设计**：
    - 前端通过 **CSS 媒体查询** 技术实现响应式设计，确保在不同设备（桌面端和移动端）上都有良好的显示效果。例如，在 `style.css` 中通过媒体查询调整了图片和表单的显示尺寸，以便在小屏设备上更好地显示内容：
      ```css
      @media (max-width: 576px) {
          .sight-card img {
              height: 150px;
          }
      }
      ```

---

### 后端技术栈

1. **Flask 框架**：
    - 项目后端采用 **Flask** 处理前端发起的 API 请求，负责与第三方 API 进行交互。Flask 通过不同的路由处理功能模块，如火车班次查询、酒店选择等。

2. **`backstage.py` 的核心逻辑**：
    - **路由处理**：
        - 每个功能模块在 `backstage.py` 中定义了对应的 Flask 路由，处理前端的请求。比如，火车班次查询模块的路由会接收前端传递的出发地和目的地，并调用 `api_12306.py` 获取班次数据，处理后返回前端展示。

3. **API 模块的工作原理**：
    - **`api_12306.py`**：通过 12306 API 获取火车班次信息，包括座位余票和票价，并将数据返回给前端。
    - **`api_hotels.py`**：通过 Tripadvisor API 获取酒店信息，用户输入目的地后，API 会返回相关酒店列表和详情。
    - **`api_food.py`**：获取餐厅和美食推荐，通过 Tripadvisor API 返回餐厅的菜单、评分和用户评价。
    - **`api_sights.py`**：提供景点推荐，通过调用 Tripadvisor API，显示景点的详细介绍、评分和地图定位。
    - **`api_weather.py`**：通过和风天气 API 获取实时天气和未来几天的天气预报信息。

---

### 后端技术栈

1. **Flask 框架**：
    - 项目后端采用 **Flask** 作为核心框架，处理前端的 API 请求，并与第三方 API 进行交互。所有功能模块都由 Flask 的路由来管理，例如火车班次查询、酒店查询、天气查询等。

2. **`backstage.py` 的核心逻辑**：
    - **路由定义与处理**：
        - 在 `backstage.py` 中定义了不同的路由，处理来自前端的请求。每个路由根据前端传递的参数（如出发地、目的地、日期等）调用相应的 API 模块，并将处理后的数据返回给前端。例如，火车班次查询通过 `/train_schedule` 路由处理。
        - Flask 服务器会解析请求，并调用对应的 API 文件进行数据获取和处理。

    - **与 API 文件的交互**：
        - `backstage.py` 充当前端与 API 模块之间的中间件。它接收前端的请求参数后，会调用位于 `Api/` 目录下的相应模块（如 `api_12306.py`、`api_hotels.py` 等），并将获取到的外部数据经过处理后返回给前端。

3. **各 `Api.py` 文件的逻辑**：

    - **`api_12306.py`（火车班次查询 API）**：
        - 通过与 12306 API 的交互，获取火车班次、余票和票价信息。前端传递出发地和目的地后，API 模块会发送 HTTP 请求，获取火车班次列表。接着解析返回的班次数据，提取如车次、座位类型、票价、余票等信息，并将其格式化后返回给前端。
        - 该模块还包含数据过滤和格式化的逻辑，如根据不同座位类型区分价格，确保用户能清晰地看到所有班次信息。

    - **`api_hotels.py`（酒店信息查询 API）**：
        - 通过 Tripadvisor API 获取用户选择地点的酒店信息，包括价格、评分、位置等。API 先发送查询请求，根据城市获取所有相关酒店，之后将信息解析为前端需要的格式（如酒店名称、地址、评分等），再返回。

    - **`api_food.py`（美食推荐 API）**：
        - 同样通过 Tripadvisor API 获取餐厅和美食信息，API 根据用户输入的目的地返回所有与之相关的餐厅推荐。它会提取餐厅名称、用户评价、菜单等关键信息，并返回给前端页面进行展示。

    - **`api_sights.py`（景点推荐 API）**：
        - 该模块通过 Tripadvisor API 获取指定地点的旅游景点信息，并根据景点的受欢迎程度、用户评分等为用户提供推荐。返回的数据经过过滤和排序后，将相关字段传递回前端供展示。

    - **`api_weather.py`（天气信息 API）**：
        - 通过和风天气 API 获取用户所查询地点的实时天气和未来几天的天气预报。API 根据前端传递的城市名称，通过调用和风的城市地理信息接口获取城市ID，并根据该ID调用天气数据接口。返回的天气信息包括温度、降雨量、日出日落等数据，并提供24小时和7天的天气预报。

4. **数据处理与返回**：
    - 每个 API 模块都采用 `requests` 库与外部 API 进行通信，并对 API 返回的 JSON 数据进行解析和处理。API 返回的原始数据中通常包含大量无关信息，模块会根据项目需求进行筛选，提取必要的字段（如火车班次的余票和票价、酒店的名称和评分等），最后将处理后的信息以 JSON 格式返回给前端。

---

### 开发及部署工具
- Flask (后端框架)
- Web API 集成：12306 API、Tripadvisor API、和风天气 API、百度地图 API

## 项目目标

- 提供便捷的火车班次、酒店信息查询
- 提供目的地景点和餐厅推荐
- 提供个性化的行程安排建议
- 提供准确的天气预报，提升出行安全性
- 整合所有功能，便于用户进行行程规划

## 功能模块

1. **信息查询模块**
    - 火车班次查询
    - 酒店信息查询
    - 景点推荐
    - 美食推荐
    - 天气预报
2. **行程规划模块**
    - 支持用户根据天气、交通、景点信息制定个性化行程

---

## 功能模块的实现

### 1.1. **火车班次查询模块**

- **前端实现**：
   - 模块页面：`select_departure_train/index.html`
   - 用户输入出发地和目的地后，页面通过 JavaScript 将这些数据传递到 URL，并使用 `fetch` API 向后端发送查询请求。
   - 在 `script.js` 中，页面加载时，JavaScript 根据用户输入的信息向后端发送请求获取火车班次数据，并动态更新页面显示。用户可以查看各个班次的车次号、出发时间、余票信息和票价。

  ```javascript
  fetch(`/train_schedule?from=${fromStation}&to=${toStation}&departure=${departureDate}`)
  .then(response => response.json())
  .then(data => {
      // 动态渲染火车班次信息
  });
  ```

- **后端实现**：
   - 路由：`/train_schedule`（定义在 `backstage.py` 中）
   - 后端接收前端发送的出发地、目的地和日期参数后，调用 `api_12306.py` 中的 `get_train_schedule` 函数，使用 12306 API 获取火车班次信息。
   - 通过对返回的班次数据进行解析，后端将车次号、出发时间、座位类型和票价等信息处理后，以 JSON 格式返回给前端。

  ```python
  @app.route("/train_schedule", methods=["GET"])
  def get_train_schedule():
      from_station = request.args.get("from")
      to_station = request.args.get("to")
      departure_date = request.args.get("departure")
      return api_12306.get_train_schedule(from_station, to_station, departure_date)
  ```

   - **API交互**：
      - `api_12306.py` 文件通过调用 12306 API 获取火车班次及其余票信息。API 调用后，返回的班次数据会被解析为可用的座位类型、余票和价格信息。

---

### 1.2. **酒店信息查询模块**

- **前端实现**：
   - 模块页面：`select_hotel/select_hotel/index.html`
   - 用户输入目的地后，前端通过 `fetch` API 向后端发送请求，获取酒店信息并展示在页面上，包括酒店名称、价格、评分、位置等。

  ```javascript
  fetch(`/hotels?destination=${destination}`)
  .then(response => response.json())
  .then(data => {
      // 动态渲染酒店信息
  });
  ```
   - 当获取到酒店的地理信息（经纬度）后，调用百度地图提供的JavaScript API来生成一个显示酒店位置的地图

- **后端实现**：
   - 路由：`/hotels`（定义在 `backstage.py` 中）
   - 后端从前端接收到目的地参数后，调用 `api_hotels.py` 中的 `get_hotels` 函数，通过 Tripadvisor API 获取酒店信息，并返回酒店名称、位置、评分和价格等信息。

  ```python
  @app.route("/hotels", methods=["GET"])
  def get_hotels():
      destination = request.args.get("destination")
      return api_hotels.get_hotels(destination)
  ```

   - **API交互**：
      - `api_hotels.py` 使用 Tripadvisor API 获取指定目的地的酒店信息，返回后对数据进行筛选，提取有用字段，如酒店名称、评分和价格。
      - 百度地图 JavaScript APi 根据经纬度信息得到一个动态地图
---

### 1.3. **景点推荐模块**

- **前端实现**：
   - 模块页面：`select_sights/show_sights/index.html`
   - 用户选择目的地后，前端通过 `fetch` API 向后端请求景点推荐信息。JavaScript 会处理并渲染返回的景点数据，如景点名称、图片、评分等。

  ```javascript
  fetch(`/sights?destination=${destination}`)
  .then(response => response.json())
  .then(data => {
      // 动态渲染景点推荐信息
  });
  ```

- **后端实现**：
   - 路由：`/sights`（定义在 `backstage.py` 中）
   - 后端接收前端传来的目的地参数，调用 `api_sights.py` 中的 `get_sights` 函数，使用 Tripadvisor API 获取景点推荐信息，并返回给前端。

  ```python
  @app.route("/sights", methods=["GET"])
  def get_sights():
      destination = request.args.get("destination")
      return api_sights.get_sights(destination)
  ```

   - **API交互**：
      - `api_sights.py` 使用 Tripadvisor API 获取指定城市的热门景点，返回后筛选景点的相关信息，如景点名称、评分和地址。

---

### 1.4. **美食推荐模块**

- **前端实现**：
   - 模块页面：`select_food/show_food/index.html`
   - 用户输入目的地后，JavaScript 使用 `fetch` API 向后端发送请求，获取美食推荐信息。页面会动态渲染返回的餐厅和菜品数据，包括餐厅名称、评分和菜单。

  ```javascript
  fetch(`/food?destination=${destination}`)
  .then(response => response.json())
  .then(data => {
      // 动态渲染美食推荐信息
  });
  ```

- **后端实现**：
   - 路由：`/food`（定义在 `backstage.py` 中）
   - 后端接收用户输入的目的地，调用 `api_food.py` 获取相应餐厅和美食的推荐信息。API 结果经过处理后，以 JSON 格式返回给前端展示。

  ```python
  @app.route("/food", methods=["GET"])
  def get_food():
      destination = request.args.get("destination")
      return api_food.get_food(destination)
  ```

   - **API交互**：
      - `api_food.py` 通过 Tripadvisor API 获取餐厅及美食信息。API 返回的数据包括餐厅名称、评分、菜单等，经过整理后传回前端。

---

### 1.5. **天气预报模块**

- **前端实现**：
   - 模块页面：`main_screen/index.html`
   - 用户选择目的地后，前端通过 `fetch` API 向后端请求该地点的实时天气和未来几天的天气预报，并将结果展示在页面上。

  ```javascript
  fetch(`/weather?city=${city}`)
  .then(response => response.json())
  .then(data => {
      // 动态渲染天气预报信息
  });
  ```

- **后端实现**：
   - 路由：`/weather`（定义在 `backstage.py` 中）
   - 后端接收用户输入的城市名称，调用 `api_weather.py` 使用和风天气 API 获取该地点的天气信息，返回温度、降雨量和日出日落等信息。

  ```python
  @app.route("/weather", methods=["GET"])
  def get_weather():
      city = request.args.get("city")
      return api_weather.get_weather_info(city)
  ```

   - **API交互**：
      - `api_weather.py` 通过和风天气 API 获取指定城市的实时天气和未来 7 天的预报。API 返回的数据包括温度、天气状况等，经过处理后返回给前端。

---

### 2 **行程规划模块的实现**

#### **前端实现**：
- **模块页面**：`make_plan/main_screen/index.html`

- **功能概述**：
  行程规划模块基于前端逻辑实现，用户可以根据输入的出发地和返回时间，生成个性化的行程计划，并且可以查看实时天气预报和相关的交通信息。整个过程通过 JavaScript 实现数据的展示和交互，无需后端支持。

#### **流程**：

1. **页面初始化与用户输入处理**：
   - 在页面加载时，JavaScript 通过 URL 参数获取用户输入的出发日期和返回日期（默认为指定的日期），并通过这些日期计算行程的总天数。页面的日期和时间表格会根据这些信息动态生成。

   ```javascript
   const departureDate = urlParams.get('departure') ? new Date(urlParams.get('departure')) : new Date();
   const returnDate = urlParams.get('return') ? new Date(urlParams.get('return')) : new Date(new Date().getFullYear(), 9, 16); // 默认返回日期
   ```

   - 页面会根据这些输入，动态计算出行的天数，并为用户展示每一天的行程信息。

2. **事件和天气数据的加载与存储**：
   - 用户的交通信息（如火车班次）被存储在本地的 `localStorage` 中，页面加载时，JavaScript 会从 `localStorage` 中加载这些事件。如果用户没有之前的选择，则使用示例数据。

   ```javascript
   let events = JSON.parse(localStorage.getItem('events')) || [
       { "start_time": "10:21", "end_time": "23:18", "date": "2024-10-03", "title": "D2208", "details": "重庆北 到 上海虹桥" },
       { "start_time": "08:01", "end_time": "21:22", "date": "2024-10-07", "title": "D2268", "details": "上海虹桥 到 重庆北" }
   ];
   ```

3. **天气信息的获取与展示**：
   - 页面通过和风天气 API 动态获取每一天的天气预报，并展示白天和夜间的天气情况、温度、日出日落时间等详细信息。
   - 天气数据存储在 `weatherData` 对象中，每一天的天气信息通过调用 API 获取，并以图标和文字的形式展示在行程计划中。

   ```javascript
   let weatherData = {};
   const weatherIconMap = {
       '晴': 'qi-100', '多云': 'qi-101', '少云': 'qi-102', '晴间多云': 'qi-103', '阴': 'qi-104',
       '小雨': 'qi-305', '中雨': 'qi-306', '大雨': 'qi-307', '暴雨': 'qi-310'
       // 更多天气类型映射
   };
   ```

   - 在用户点击某一天的日期时，JavaScript 会展示当天的详细天气信息，使用气泡窗口展示详细的白天和夜间天气、温度和日出日落时间。

   ```javascript
   function showWeatherDetails(dateStr, weather) {
       popupDate.textContent = dateStr;
       popupWeather.innerHTML = `
           <strong>白天天气：</strong>${weather.textDay} <i class="qi-${weather.iconDay}"></i><br>
           <strong>夜间天气：</strong>${weather.textNight} <i class="qi-${weather.iconNight}"></i><br>
           <strong>最高温度：</strong>${weather.tempMax}°<br>
           <strong>最低温度：</strong>${weather.tempMin}°<br>
           <strong>日出时间：</strong>${weather.sunrise}<br>
           <strong>日落时间：</strong>${weather.sunset}<br>
       `;
       popup.classList.add('show');
       popup.style.display = "block";
   }
   ```

4. **页面跳转与其他模块的联动**：
   - 用户在行程规划页面可以通过点击相应按钮跳转到其他模块页面，如酒店选择、美食推荐和景点推荐等。JavaScript 负责将当前页面的 URL 参数保留，并传递给下一个页面。

   ```javascript
   window.navigate = function(page) {
       if (page === 'hotel') {
           window.location.href = `../select_hotel/set_params/index.html?${urlParams.toString()}`;
       } else if (page === 'food') {
           window.location.href = `../select_food/show_food/index.html?${urlParams.toString()}`;
       } else if (page === 'scenic') {
           window.location.href = `../select_sights/show_sights/index.html?${urlParams.toString()}`;
       }
   }
   ```

5. **用户交互与选择事件的处理**：
   - 用户可以选择查看具体某一天的天气、交通等详细信息。通过事件监听器，JavaScript 可以实时响应用户的点击操作，动态展示信息。

   ```javascript
   const closePopup = document.getElementById('close-popup');
   closePopup.addEventListener('click', () => {
       const popup = document.getElementById('weather-popup');
       popup.classList.remove('show');
       popup.style.display = "none";
   });
   ```
   
---

## 项目成果
## **信息获取与展示模块**
- **火车班次查询模块**
    - 实现了12306 API调用，能够查询火车班次、余票和票价
- **酒店信息查询模块**
    - 集成 Tripadvisor API 获取并展示酒店信息
    - 使用百度地图 API 在地图上显示出酒店的位置
- **天气预报模块**
    - 使用和风天气 API 提供准确的天气预报
- **景点推荐模块**
    - 使用 Tripadvisor API 获取热门景点和评价
- **美食推荐模块**
    - 根据地点推荐餐厅和美食，并支持导航功能
## **出行方案规划模块**
- 实时加载用户制定的出行计划信息，配合天气预报模块为用户提供良好的出行计划制定体验


感谢你提供了调用 API 的确切函数。我将根据你提供的源代码，准确地描述各个 API 的调用方式，包括 URL、请求参数、以及调用逻辑。

---

## API 调用

### 1. **火车班次 API**：12306 API

- **API URL**：
    - 通过访问 `https://kyfw.12306.cn/otn/leftTicket/query` 查询火车班次、余票和票价信息。

- **请求方式**：
    - 使用 `requests.get` 发送 HTTP GET 请求，并附带查询参数和完整的请求头信息。

- **调用方式**：
    - 在 `get_raw_info` 函数中，通过传递出发站、目的站、出发日期以及乘车类型（如成人票），发送请求获取火车班次信息。
    - 代码包含完整的 `headers` 参数，以模拟用户浏览器的请求，确保 12306 API 的访问。

  ```python
  def get_raw_info(from_station, to_station, departure_date, ticket_type):
      url = "https://kyfw.12306.cn/otn/leftTicket/query"
      params = {
          "leftTicketDTO.train_date": departure_date,  # 出发日期
          "leftTicketDTO.from_station": trans_city_name(from_station),  # 出发站
          "leftTicketDTO.to_station": trans_city_name(to_station),  # 到达站
          "purpose_codes": ticket_type  # 乘车类型 (成人票)
      }
      headers = {
          # 定义完整的 HTTP 请求头
      }
      response = requests.get(url, headers=headers, params=params)
      return response.json()  # 返回火车班次数据
  ```

- **请求参数**：
    - `leftTicketDTO.train_date`: 出发日期
    - `leftTicketDTO.from_station`: 出发站名称（经过 `trans_city_name` 函数转换）
    - `leftTicketDTO.to_station`: 目的站名称（经过 `trans_city_name` 函数转换）
    - `purpose_codes`: 乘车类型（如成人票）

---

### 2. **美食查询 API**：Tripadvisor API

- **API URL**：
    - 访问 `https://api.tripadvisor.cn/restapi/soa2/21218/restaurantListForPc` 获取餐厅列表及美食信息。

- **请求方式**：
    - 使用 `requests.post` 发送 POST 请求，带有完整的 `payload` 作为查询条件。

- **调用方式**：
    - 在 `get_raw_food_data` 函数中，使用过滤条件（如餐厅类型、价格区间、菜系等）获取特定国家或城市的美食信息，并传递页面索引来进行分页。

  ```python
  def get_raw_food_data(country, page):
      url = "https://api.tripadvisor.cn/restapi/soa2/21218/restaurantListForPc"
      payload = {
          "filters": [ ... ],
          "geoId": get_geo_id(country),  # 通过 geoId 确定地点
          "pageIndex": page,
          "pageSize": 30,
          "sort": "RANK"
      }
      headers = {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 ..."
      }
      response = requests.post(url, json=payload, headers=headers)
      return response.json().get("masterRestaurants").get("restaurants")
  ```

- **请求参数**：
    - `geoId`: 地理位置 ID（通过 `get_geo_id` 函数获取）
    - `pageIndex`: 当前页面索引，用于分页
    - `pageSize`: 每页条目数
    - `sort`: 排序方式（按排名排序）

---

### 3. **酒店查询 API**：Tripadvisor API

- **API URL**：
    - 通过 `https://api.tripadvisor.cn/restapi/soa2/20874/hotelListForPc` 获取酒店列表信息。

- **请求方式**：
    - 使用 `requests.post` 发送 POST 请求，并传递检查日期、房间数量等参数。

- **调用方式**：
    - 在 `get_raw_hotels_info` 函数中，通过 `geoId` 和日期参数获取指定城市的酒店列表，并通过分页索引管理结果页数。

  ```python
  def get_raw_hotels_info(country, checkInDate, checkOutDate, adultNum, childNum, roomNum, pageIndex):
      url = "https://api.tripadvisor.cn/restapi/soa2/20874/hotelListForPc"
      payload = {
          "geoId": get_geo_id(country),  # 获取地点的 geoId
          "checkInDate": checkInDate,
          "checkOutDate": checkOutDate,
          "adultNum": adultNum,
          "childNum": childNum,
          "roomNum": roomNum,
          "pageIndex": pageIndex,
          "pageSize": 30
      }
      headers = {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 ..."
      }
      response = requests.post(url, json=payload, headers=headers)
      return response.json().get("hotels")
  ```

- **请求参数**：
    - `geoId`: 地理位置 ID
    - `checkInDate`: 入住日期
    - `checkOutDate`: 退房日期
    - `adultNum`: 成人数量
    - `childNum`: 儿童数量
    - `roomNum`: 房间数量
    - `pageIndex`: 页面索引（分页）

---

### 4. **景点查询 API**：Tripadvisor API

- **API URL**：
    - 通过 `https://api.tripadvisor.cn/restapi/soa2/20405/getPCSightList` 获取城市的景点列表。

- **请求方式**：
    - 使用 `requests.post` 发送 POST 请求，传递 `geoId` 和过滤器等参数。

- **调用方式**：
    - 在 `get_raw_sights_info` 函数中，通过传递 `geoId` 和页面索引，获取分页景点信息。

  ```python
  def get_raw_sights_info(country, page):
      url = "https://api.tripadvisor.cn/restapi/soa2/20405/getPCSightList"
      payload = {
          "geoId": get_geo_id(country),  # 获取 geoId
          "pageIndex": page,
          "pageSize": 30,
          "filters": [ ... ]
      }
      headers = {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 ..."
      }
      response = requests.post(url, json=payload, headers=headers)
      return response.json().get("verticalData")  # 返回景点信息
  ```

- **请求参数**：
    - `geoId`: 地理位置 ID
    - `pageIndex`: 页面索引（分页）
    - `pageSize`: 每页条目数

---

### 5. **天气查询 API**：和风天气 API

- **API URL**：
    - 7 天预报：`https://devapi.qweather.com/v7/weather/7d`
    - 24 小时预报：`https://devapi.qweather.com/v7/weather/24h`

- **请求方式**：
    - 使用 `requests.get` 发送 HTTP GET 请求，传递城市地理 ID 和 API 密钥。

- **调用方式**：
    - 在 `get_raw_7d_weather` 和 `get_raw_24h_weather` 函数中，使用和风天气 API 获取天气信息。

  ```python
  def get_raw_7d_weather(city):
      url = "https://devapi.qweather.com/v7/weather/7d"
      params = {
          "location": get_city_geo_info(city),  # 获取城市地理信息
          "key": key,
          "lang": "zh"
      }
      res = requests.get(url, params=params)
      return res.json()

  def get_raw_24h_weather(city):
      url = "https://devapi.qweather.com/v7/weather/24h"
      params = {
          "location": get_city_geo_info(city),  # 获取城市地理信息
          "key": key,
          "lang": "zh"
      }
      res = requests.get(url, params=params)
      return res.json().get("hourly")
  ```

- **请求参数**：
    - `location`: 城市 ID（通过 `get_city_geo_info` 函数获取）
    - `key`: 和风天气 API 密钥
    - `lang`: 返回语言（如中文为 "zh"）

---

### 6. **地理信息 API**：百度地图 API

- **调用方式**：
    - 在前端 JavaScript 中，通过 `BMap`（百度地图对象）创建地图实例，并使用各种 API 功能，例如设置中心点、缩放级别、标注地点等。

  ```javascript
  const map = new BMap.Map("map-container");  // 创建地图实例
  const point = new BMap.Point(116.404, 39.915);  // 设置中心点坐标
  map.centerAndZoom(point, 15);  // 设置中心点和缩放级别
  ```

    - 还可以通过 `BMap.Marker` 在地图上添加标注（如景点或餐厅位置）：

  ```javascript
  const marker = new BMap.Marker(point);  // 创建标注
  map.addOverlay(marker);  // 将标注添加到地图上
  ```

- **请求参数**：
    - `v`: API 版本号（如 `3.0`）
    - `ak`: 百度地图 API 密钥

---

## 参考文档
- 百度地图 API 文档
- 和风天气 API 文档
- Flask 框架文档

