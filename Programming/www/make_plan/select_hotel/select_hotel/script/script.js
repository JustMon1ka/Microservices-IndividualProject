document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get('country');
    const checkInDate = urlParams.get('checkInDate');
    const checkOutDate = urlParams.get('checkOutDate');
    const adultNum = urlParams.get('adultNum');
    const childNum = urlParams.get('childNum');
    const roomNum = urlParams.get('roomNum');

    urlParams.delete('country')
    urlParams.delete('checkInDate')
    urlParams.delete('checkOutDate')
    urlParams.delete('adultNum')
    urlParams.delete('childNum')
    urlParams.delete('roomNum')

    let pageIndex = 1;
    let loading = false;  // 防止重复加载
    let hasMoreHotels = true;  // 判断是否还有更多酒店数据
    let selectedHotelId = null;  // 记录选中的酒店ID

    const loadingOverlay = document.getElementById('loading-overlay');
    const confirmButton = document.getElementById('confirm-button');

    // 初始加载酒店信息
    loadHotels();

    // 监听滚动事件，检查是否快滚动到底部
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading && hasMoreHotels) {
            pageIndex++;
            loadHotels();
        }
    });

    function showLoading() {
        loadingOverlay.style.display = 'flex'; // 显示加载效果
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none'; // 隐藏加载效果
    }

    function loadHotels() {
        loading = true;  // 设置为加载状态
        showLoading();  // 显示加载动画
        const hotelList = document.getElementById('hotel-list');

        fetch(`http://localhost:9999/get_hotels?country=${country}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adultNum=${adultNum}&childNum=${childNum}&roomNum=${roomNum}&pageIndex=${pageIndex}`)
            .then(response => response.json())
            .then(data => {
                // 如果没有更多数据，停止加载
                if (!data.hotels || Object.keys(data.hotels).length === 0) {
                    hasMoreHotels = false;
                    hideLoading();
                    return;
                }

                // 遍历返回的酒店数据并显示
                Object.keys(data.hotels).forEach(hotelId => {
                    const hotel = data.hotels[hotelId];
                    const listItem = document.createElement('li');

                    // 提取价格信息时，先检查 prices 是否存在
                    let priceInfo = '暂无价格';
                    if (hotel.prices && hotel.prices.length > 0) {
                        priceInfo = hotel.prices[0].displayPrice || '暂无价格';
                    }

                    listItem.innerHTML = `
                        <li id="hotel-${hotelId}">
                            <div class="hotel-info">
                                <img class="hotel-image" src="${hotel.medium_image_url}" alt="酒店图片">
                                <div class="hotel-details">
                                    <div class="hotel-name">${hotel.hotel_name}</div>  <!-- 仅展示中文酒店名 -->
                                    <div class="hotel-ranking">${hotel.ranking}</div>
                                    <div class="hotel-rating">评分: ${hotel.review_rating}, 评论数: ${hotel.review_count}</div>
                                    <div class="hotel-facilities">设施: ${hotel.facilities.join(', ')}</div>
                                    <button class="show-map-button" data-lat="${hotel.latitude}" data-lng="${hotel.longitude}" data-location="${hotel.hotel_name}">显示地图</button>
                                </div>
                                <div class="hotel-price" style="font-size: 1.5em; font-weight: bold; color: red;">
                                    价格: ${priceInfo}
                                </div>
                            </div>
                            <div class="hotel-map hidden" id="map-${hotelId}">
                                <div id="map-content-${hotelId}" style="height: 300px;"></div>
                                <div id="location-text-${hotelId}"></div>
                            </div>
                        </li>
                    `;

                    hotelList.appendChild(listItem);

                    // 添加点击选择酒店的功能
                    listItem.addEventListener('click', () => {
                        selectedHotelId = hotelId;
                        confirmButton.disabled = false;  // 启用确认按钮
                        // 在视觉上高亮选中的酒店
                        document.querySelectorAll('li').forEach(item => item.style.backgroundColor = '');
                        listItem.style.backgroundColor = '#d0e6f7';
                    });
                });

                // 添加点击显示地图的功能
                document.querySelectorAll('.show-map-button').forEach(button => {
                    button.addEventListener('click', function (event) {
                        event.stopPropagation(); // 阻止事件冒泡，避免影响酒店选择
                        let hotelId = button.closest('li').id;
                        if (hotelId) {
                            hotelId = hotelId.replace("hotel-", "");
                        } else {
                            console.error('Hotel ID not found.');
                        }
                        const lat = button.getAttribute('data-lat');
                        const lng = button.getAttribute('data-lng');
                        const location = button.getAttribute('data-location');

                        // 显示该酒店对应的地图区域
                        showMap(hotelId, lat, lng, location);
                    });
                });

                loading = false;  // 取消加载状态
                hideLoading();  // 隐藏加载动画
            })
            .catch(error => {
                console.error('Error fetching hotel data:', error);
                loading = false;  // 取消加载状态
                hideLoading();  // 隐藏加载动画，即使加载失败
            });
    }

    function showMap(hotelId, lat, lng, location) {
        const mapContainer = document.getElementById(`map-${hotelId}`);
        const mapElement = document.getElementById(`map-content-${hotelId}`);
        const locationText = document.getElementById(`location-text-${hotelId}`);

        // 切换地图容器的可见性
        mapContainer.classList.toggle('hidden');

        // 设置地图上的位置和显示酒店的文字位置
        locationText.innerHTML = `酒店位置: ${location}`;

        // 创建百度地图实例
        const map = new BMap.Map(mapElement);  // 创建Map实例
        const point = new BMap.Point(lng, lat);  // 创建点坐标，注意百度地图的经纬度顺序是 (lng, lat)
        map.centerAndZoom(point, 15);  // 初始化地图，设置中心点坐标和地图级别

        // 添加标记
        const marker = new BMap.Marker(point);  // 创建标记
        map.addOverlay(marker);  // 将标记添加到地图中

        // 设置地图上的控件（例如缩放控件）
        const navigationControl = new BMap.NavigationControl();
        map.addControl(navigationControl);  // 添加平移缩放控件
    }

    // 确认按钮点击事件
    confirmButton.addEventListener('click', function() {
        if (selectedHotelId) {
            const hotelName = document.querySelector(`#hotel-${selectedHotelId} .hotel-name`).textContent;

            // 获取入住日期和退房日期
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);

            // 循环生成多个 event 条目
            let events = JSON.parse(localStorage.getItem('events')) || [];
            let currentDate = new Date(checkIn);

            while (currentDate <= checkOut) {
                events.push({
                    start_time: "00:00",
                    end_time: "00:30",
                    date: currentDate.toISOString().split('T')[0],  // 格式化为 YYYY-MM-DD
                    title: hotelName,
                    details: ""  // 置空
                });

                // 日期加1
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 保存到 localStorage
            localStorage.setItem('events', JSON.stringify(events));

            // 跳转到 main_screen 并保留其他参数
            window.location.href = `../../main_screen/index.html?${urlParams.toString()}`;
        }
    });
});
