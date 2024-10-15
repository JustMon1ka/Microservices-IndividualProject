urlParams = Node;

document.addEventListener('DOMContentLoaded', function () {
    const calendarGrid = document.getElementById('calendar-grid');
    urlParams = new URLSearchParams(window.location.search);

    // 获取日期范围，没有值时设置默认日期（假设默认为10月4日至10月11日）
    const departureDate = urlParams.get('departure') ? new Date(urlParams.get('departure')) : new Date(new Date().getFullYear(), 9, 14); // 月份从0开始，9代表10月
    departureDate.setHours(0, 0, 0, 0); // 设置时间为午夜

    const returnDate = urlParams.get('return') ? new Date(urlParams.get('return')) : new Date(new Date().getFullYear(), 9, 16); // 默认10月11日
    returnDate.setHours(0, 0, 0, 0); // 设置时间为午夜

    // 定义日期和时间
    const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const startHour = 0;  // 从 0 点开始
    const endHour = 24;   // 到 24 点结束
    const daysPerPage = 7; // 每页显示7天

    // 计算总天数和总页数
    let totalDays = Math.floor((returnDate - departureDate) / (1000 * 60 * 60 * 24)) + 1;
    let totalPages = Math.ceil(totalDays / daysPerPage);
    let currentPage = 0;  // 当前页码，0表示第一页

    // 获取浏览器中的事件，或使用示例事件
    let events = JSON.parse(localStorage.getItem('events')) || [
        {
            "start_time": "10:21",
            "end_time": "23:18",
            "date": "2024-10-03",
            "title": "D2208",
            "details": "重庆北 到 上海虹桥"
        },
        {
            "start_time": "08:01",
            "end_time": "21:22",
            "date": "2024-10-07",
            "title": "D2268",
            "details": "上海虹桥 到 重庆北"
        }
    ];

    // 存储天气数据
    let weatherData = {};

    // 天气类型到和风天气图标类名的映射
    const weatherIconMap = {
        '晴': 'qi-100',
        '多云': 'qi-101',
        '少云': 'qi-102',
        '晴间多云': 'qi-103',
        '阴': 'qi-104',
        '雷阵雨': 'qi-302',
        '强雷阵雨': 'qi-303',
        '雷阵雨伴有冰雹': 'qi-304',
        '小雨': 'qi-305',
        '中雨': 'qi-306',
        '大雨': 'qi-307',
        '暴雨': 'qi-310',
        '大暴雨': 'qi-311',
        '特大暴雨': 'qi-312',
        '冻雨': 'qi-313',
        '小到中雨': 'qi-314',
        '中到大雨': 'qi-315',
        '大到暴雨': 'qi-316',
        '暴雨到大暴雨': 'qi-317',
        '大暴雨到特大暴雨': 'qi-318',
        '雨': 'qi-399',
        '小雪': 'qi-400',
        '中雪': 'qi-401',
        '大雪': 'qi-402',
        '暴雪': 'qi-403',
        '雨夹雪': 'qi-404',
        '雨雪天气': 'qi-405',
        '阵雨夹雪': 'qi-406',
        '阵雪': 'qi-407',
        '小到中雪': 'qi-408',
        '中到大雪': 'qi-409',
        '大到暴雪': 'qi-410',
        '薄雾': 'qi-500',
        '雾': 'qi-501',
        '霾': 'qi-502',
        '扬沙': 'qi-503',
        '浮尘': 'qi-504',
        '沙尘暴': 'qi-507',
        '强沙尘暴': 'qi-508',
        '浓雾': 'qi-509',
        '强浓雾': 'qi-510',
        '中度霾': 'qi-511',
        '重度霾': 'qi-512',
        '严重霾': 'qi-513',
        '大雾': 'qi-514',
        '特强浓雾': 'qi-515',
        '热': 'qi-900',
        '冷': 'qi-901',
        '未知': 'qi-999',
        // 添加其他天气类型及对应图标
    };

    // 分页控件
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');

    prevWeekBtn.addEventListener('click', function () {
        if (currentPage > 0) {
            currentPage--;
            renderCalendar();
        }
    });

    nextWeekBtn.addEventListener('click', function () {
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderCalendar();
        }
    });

    async function fetchWeather(country = '重庆') {
        try {
            const response = await fetch(`http://localhost:9999/get_weather?country=${encodeURIComponent(country)}`);
            if (!response.ok) {
                throw new Error('网络响应不是OK');
            }
            const data = await response.json();
            console.log(data);
            weatherData = data.weather.weather_7d; // 假设使用7天天气数据
        } catch (error) {
            console.error('获取天气数据失败:', error);
        }
    }

    // 初始化天气数据
    fetchWeather().then(() => {
        renderCalendar(); // 确保在获取到天气数据后渲染日历
    });

    function renderCalendar() {
        // 清空日历网格内容
        calendarGrid.innerHTML = '';

        const startDay = currentPage * daysPerPage;
        const endDay = Math.min(startDay + daysPerPage, totalDays);
        const currentDaysPerPage = endDay - startDay;

        // 动态设置 grid 列数
        calendarGrid.style.gridTemplateColumns = `180px repeat(${currentDaysPerPage}, 1fr)`;

        // 添加时间列的空白格子
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);

        // 生成日期标题
        let currentDate = new Date(departureDate);
        currentDate.setDate(currentDate.getDate() + startDay);
        for (let i = startDay; i < endDay; i++) {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');

            const month = currentDate.getMonth() + 1;
            const date = currentDate.getDate();
            const dayName = daysOfWeek[currentDate.getDay()];
            dayHeader.innerHTML = `<div>${month}/${date} ${dayName}</div>`;

            const dateStr = formatDate(currentDate);

            // 添加简略天气信息
            const weather = weatherData[dateStr];
            if (weather) {
                const tempMax = weather.tempMax;
                const tempMin = weather.tempMin;
                const textDay = weather.textDay;
                const iconDay = weather.iconDay || mapTextToIcon(textDay); // 获取天气图标代码

                const weatherInfo = document.createElement('div');
                weatherInfo.classList.add('weather-info');

                // 使用和风天气图标
                const icon = document.createElement('i');
                icon.classList.add(`qi-${iconDay}`);

                const tempText = document.createElement('span');
                tempText.textContent = `${tempMin}°~${tempMax}°`;

                weatherInfo.appendChild(icon);
                weatherInfo.appendChild(tempText);

                dayHeader.appendChild(weatherInfo);
            }

            // 添加点击事件以显示天气详情
            dayHeader.addEventListener('click', () => {
                showWeatherPopup(dateStr);
            });

            calendarGrid.appendChild(dayHeader);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 生成时间行及其内容
        for (let hour = startHour; hour < endHour; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.classList.add('time-label');
            timeLabel.textContent = `${hour}:00`;
            calendarGrid.appendChild(timeLabel);

            for (let i = startDay; i < endDay; i++) {
                const timeSlot = document.createElement('div');
                timeSlot.classList.add('time-slot');

                // 获取当前日期
                const currentDate = new Date(departureDate);
                currentDate.setDate(currentDate.getDate() + i);
                const dateStr = formatDate(currentDate);

                // 获取天气数据
                const weather = weatherData[dateStr];
                if (weather) {
                    const sunrise = parseTime(weather.sunrise); // 返回小时数，如6.5
                    const sunset = parseTime(weather.sunset);

                    const slotStart = hour;
                    const slotEnd = hour + 1;

                    // 判断时间格子的状态
                    if (slotEnd < sunrise || slotStart >= sunset) {
                        // 完全是夜晚
                        timeSlot.style.backgroundColor = '#5292b1'; // 夜晚颜色
                    } else if (slotStart >= sunrise && slotEnd <= sunset && slotStart > sunrise && slotEnd < sunset) {
                        // 完全是白天
                        timeSlot.style.backgroundColor = '#edd374'; // 白天颜色
                    } else {
                        // 包含日出或日落的时间格子
                        let transitionTime;
                        let isSunrise;
                        if (sunrise >= slotStart && sunrise <= slotEnd) {
                            // 日出在这个时间格子内
                            transitionTime = sunrise;
                            isSunrise = true;
                        } else if (sunset >= slotStart && sunset <= slotEnd) {
                            // 日落在这个时间格子内
                            transitionTime = sunset;
                            isSunrise = false;
                        } else {
                            // 不应该发生的情况
                            transitionTime = (slotStart + slotEnd) / 2;
                            isSunrise = true;
                        }

                        // 计算过渡位置
                        const transitionPercentage = ((transitionTime - slotStart) / (slotEnd - slotStart)) * 100;

                        // 处理分界线位置在 0% 或 100% 的情况
                        let dividerPosition = transitionPercentage;
                        if (dividerPosition <= 0) {
                            dividerPosition = 0.5; // 避免在 0% 时不可见
                        } else if (dividerPosition >= 100) {
                            dividerPosition = 99.5; // 避免在 100% 时不可见
                        }

                        if (isSunrise) {
                            // 日出：从夜晚过渡到白天
                            let gradientColors = [];
                            const steps = 10; // 分成10个层次
                            for (let j = 0; j <= steps; j++) {
                                const percentage = transitionPercentage * (j / steps);
                                const color = interpolateColor('#5292b1', '#edd374', j / steps);
                                gradientColors.push(`${color} ${percentage}%`);
                            }
                            gradientColors.push('#edd374 100%');

                            // 设置渐变背景
                            timeSlot.style.background = `linear-gradient(to bottom, ${gradientColors.join(', ')})`;

                            // 添加分界线
                            const divider = document.createElement('div');
                            divider.classList.add('sunrise-sunset-divider');
                            divider.style.top = `${transitionPercentage}%`;
                            timeSlot.appendChild(divider);
                        } else {
                            // 日落：从白天过渡到夜晚
                            let gradientColors = [];
                            const steps = 10; // 分成10个层次
                            for (let j = 0; j <= steps; j++) {
                                const percentage = transitionPercentage + ((100 - transitionPercentage) * (j / steps));
                                const color = interpolateColor('#edd374', '#5292b1', j / steps);
                                gradientColors.push(`${color} ${percentage}%`);
                            }
                            // 添加起始颜色节点
                            gradientColors.unshift(`#edd374 ${transitionPercentage}%`);

                            // 设置渐变背景
                            timeSlot.style.background = `linear-gradient(to bottom, ${gradientColors.join(', ')})`;

                            // 添加分界线
                            const divider = document.createElement('div');
                            divider.classList.add('sunrise-sunset-divider');
                            divider.style.top = `${transitionPercentage}%`;
                            timeSlot.appendChild(divider);
                        }
                    }
                }
                calendarGrid.appendChild(timeSlot);
            }
        }

        // 加载并显示事件
        loadEvents(events, departureDate, startDay, endDay, currentDaysPerPage);

        // 更新按钮状态
        prevWeekBtn.disabled = (currentPage === 0);
        nextWeekBtn.disabled = (currentPage === totalPages - 1);
    }

    // 颜色插值函数，从color1到color2，t取值范围0到1
    function interpolateColor(color1, color2, t) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 将十六进制颜色转换为RGB对象
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(s => s + s).join('');
        }
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // 解析时间，将 "hh:mm" 格式转为小时数（用于定位事件条）
    function parseTime(timeStr) {
        const [hour, minute] = timeStr.split(':').map(Number);
        return hour + minute / 60;
    }

    // 通过严格计算事件发生的日期差值来获取准确的日期列
    function getEventDayIndex(eventDate, departureDate) {
        const diffInMs = eventDate.getTime() - departureDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        return diffInDays;
    }

    // 加载事件并在日历上显示
    function loadEvents(events, departureDate, startDay, endDay, currentDaysPerPage) {
        events.forEach(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0); // 确保时间部分为午夜
            const eventDayIndex = getEventDayIndex(eventDate, departureDate);  // 获取事件的天数索引

            // 仅在当前分页范围内的事件才会显示
            if (eventDayIndex >= startDay && eventDayIndex < endDay) {
                const startTime = parseTime(event.start_time);
                const endTime = parseTime(event.end_time);
                const eventColumn = eventDayIndex - startDay; // 从0开始计算

                const rowOffset = Math.floor(startTime) * currentDaysPerPage; // 正确计算 rowOffset
                const cellIndex = rowOffset + eventColumn; // 不再加1，跳过时间标签列

                const timeSlots = calendarGrid.querySelectorAll('.time-slot');
                const startCell = timeSlots[cellIndex]; // 0-based index

                if (startCell) {
                    // 创建事件条
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.textContent = `${event.title}: ${event.details}`;

                    // 修正时间的偏移和高度
                    const eventStartMinutes = (startTime - Math.floor(startTime)) * 60;
                    eventDiv.style.height = `${(endTime - startTime) * 80}px`;  // 每小时高度为 80px
                    eventDiv.style.top = `${(eventStartMinutes / 60) * 80}px`;  // 修正事件起始时间的位置偏移

                    // 样式调整
                    startCell.style.position = 'relative'; // 确保事件定位正确
                    eventDiv.style.position = 'absolute';
                    eventDiv.style.left = '0';
                    eventDiv.style.right = '0';
                    eventDiv.style.backgroundColor = 'rgba(255,170,170,0.6)';
                    eventDiv.style.border = '1px solid #007BFF';
                    eventDiv.style.borderRadius = '4px';
                    eventDiv.style.padding = '2px';
                    eventDiv.style.boxSizing = 'border-box';
                    eventDiv.style.overflow = 'hidden';
                    eventDiv.style.whiteSpace = 'nowrap';
                    eventDiv.style.textOverflow = 'ellipsis';

                    // 插入事件条
                    startCell.appendChild(eventDiv);
                } else {
                    console.error(`找不到对应的时间格子: ${cellIndex}`);
                }
            }
        });
    }

    // 格式化日期为 'YYYY-MM-DD'
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 根据天气描述映射到图标代码
    function mapTextToIcon(text) {
        const map = {
            '晴': '100',
            '多云': '101',
            '少云': '102',
            '晴间多云': '103',
            '阴': '104',
            '雷阵雨': '302',
            '强雷阵雨': '303',
            '雷阵雨伴有冰雹': '304',
            '小雨': '305',
            '中雨': '306',
            '大雨': '307',
            '暴雨': '310',
            '大暴雨': '311',
            '特大暴雨': '312',
            '冻雨': '313',
            '小到中雨': '314',
            '中到大雨': '315',
            '大到暴雨': '316',
            '暴雨到大暴雨': '317',
            '大暴雨到特大暴雨': '318',
            '雨': '399',
            '小雪': '400',
            '中雪': '401',
            '大雪': '402',
            '暴雪': '403',
            '雨夹雪': '404',
            '雨雪天气': '405',
            '阵雨夹雪': '406',
            '阵雪': '407',
            '小到中雪': '408',
            '中到大雪': '409',
            '大到暴雪': '410',
            '薄雾': '500',
            '雾': '501',
            '霾': '502',
            '扬沙': '503',
            '浮尘': '504',
            '沙尘暴': '507',
            '强沙尘暴': '508',
            '浓雾': '509',
            '强浓雾': '510',
            '中度霾': '511',
            '重度霾': '512',
            '严重霾': '513',
            '大雾': '514',
            '特强浓雾': '515',
            '热': '900',
            '冷': '901',
            '未知': '999',
            // 添加其他天气类型及对应图标
        };
        return map[text] || '999'; // 默认使用'999'表示未知
    }

    // 显示天气详情气泡
    function showWeatherPopup(dateStr) {
        const popup = document.getElementById('weather-popup');
        const popupDate = document.getElementById('popup-date');
        const popupWeather = document.getElementById('popup-weather');

        const weather = weatherData[dateStr];
        if (weather) {
            const iconDay = weather.iconDay || mapTextToIcon(weather.textDay);
            const iconNight = weather.iconNight || mapTextToIcon(weather.textNight);

            popupDate.textContent = dateStr;
            popupWeather.innerHTML = `
                <strong>白天天气：</strong>${weather.textDay} <i class="qi-${iconDay}"></i><br>
                <strong>夜间天气：</strong>${weather.textNight} <i class="qi-${iconNight}"></i><br>
                <strong>最高温度：</strong>${weather.tempMax}°<br>
                <strong>最低温度：</strong>${weather.tempMin}°<br>
                <strong>日出时间：</strong>${weather.sunrise}<br>
                <strong>日落时间：</strong>${weather.sunset}<br>
            `;
        } else {
            popupDate.textContent = dateStr;
            popupWeather.textContent = '暂无详细天气信息';
        }
        popup.classList.add('show');
        popup.style.display = "block";
    }

    // 关闭天气详情气泡
    const closePopup = document.getElementById('close-popup');
    closePopup.addEventListener('click', () => {
        const popup = document.getElementById('weather-popup');
        popup.classList.remove('show');
        popup.style.display = "none";
    });

    // 点击气泡外部关闭气泡
    window.addEventListener('click', function(event) {
        const popup = document.getElementById('weather-popup');
        if (event.target === popup) {
            popup.classList.remove('show');
            popup.style.display = "none";
        }
    });

    // 页面跳转函数保持不变
    window.navigate = function(page) {
        if (page === 'hotel') {
            window.location.href = `../select_hotel/set_params/index.html?${urlParams.toString()}`;
        } else if (page === 'food') {
            window.location.href = `../select_food/show_food/index.html?${urlParams.toString()}`;
        } else if (page === 'scenic') {
            window.location.href = `../select_sights/show_sights/index.html?${urlParams.toString()}`;
        }
    }
});
