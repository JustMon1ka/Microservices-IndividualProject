document.addEventListener('DOMContentLoaded', function() {
    urlParams = new URLSearchParams(window.location.search);
    fromStation = urlParams.get('from_station');
    toStation = urlParams.get('to_station');
    departureDate = urlParams.get('departure');
    backDate = urlParams.get('back');

    // 发起请求，获取火车票信息
    fetch(`http://localhost:9999/get_trains?from_station=${fromStation}&to_station=${toStation}&departure=${departureDate}`)
        .then(response => response.json())
        .then(data => {
            const trainList = document.getElementById('train-list');
            trainList.innerHTML = ''; // 清空之前的内容

            // 检查是否有火车数据
            if (Object.keys(data.trains).length === 0) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `没有查询到火车票信息，请返回重新输入信息或跳过。`;
                trainList.appendChild(listItem);
                return;
            }

            // 遍历返回的火车数据
            for (const trainNo in data.trains) {
                const train = data.trains[trainNo];

                // 定义 listItem 变量
                const listItem = document.createElement('li');

                // 初始只显示大致信息，并添加选择框
                listItem.innerHTML = `
                    <input type="radio" name="train" value="${trainNo}" 
                           data-departure="${train.departure}" 
                           data-arrival="${train.arrival}" 
                           data-from="${train.from}" 
                           data-to="${train.to}">
                    <div class="train-info">
                        <div>
                            <strong>${trainNo}</strong> - ${train.from} → ${train.to}
                            <br>
                            ${train.departure} - ${train.arrival} (${train.last})
                        </div>
                        <div>￥${train.seats_info[Object.keys(train.seats_info)[0]].price}起</div>
                    </div>
                    <div class="train-detail hidden">
                        ${Object.keys(train.seats_info).map(seatType => `
                            <div>
                                ${seatType}: ¥${train.seats_info[seatType].price}, ${train.seats_info[seatType].remain}
                            </div>
                        `).join('')}
                    </div>
                `;

                // 添加点击事件：点击时显示/隐藏详细信息
                listItem.addEventListener('click', function() {
                    const detailDiv = listItem.querySelector('.train-detail');
                    detailDiv.classList.toggle('hidden');  // 切换显示状态
                });

                // 将 listItem 添加到列表中
                trainList.appendChild(listItem);
            }

            // 显示确认按钮
            document.getElementById('confirm-train-btn').classList.remove('hidden');
        })
        .catch(error => {
            const trainList = document.getElementById('train-list');
            trainList.innerHTML = `<li>查询火车票时出错，可能是火车票还未发售，请返回或跳过此步。</li>`;
            console.error('Error:', error);
        });
});

// 处理返回按钮的点击事件
document.getElementById('back-btn').addEventListener('click', function() {
    window.location.href = '../welcome/index.html';  // 跳转到 welcome 界面
});

// 处理跳过按钮的点击事件
document.getElementById('skip-btn').addEventListener('click', function() {
    window.location.href = `../select_back_train/index.html?from_station=${fromStation}&to_station=${toStation}&departure=${departureDate}&back=${backDate}`;
});

// 处理用户选择火车并保存事件
document.getElementById('confirm-train-btn').addEventListener('click', function() {
    const selectedTrain = document.querySelector('input[name="train"]:checked');
    if (selectedTrain) {
        const trainNo = selectedTrain.value;
        const departureTime = selectedTrain.getAttribute('data-departure');
        const arrivalTime = selectedTrain.getAttribute('data-arrival');
        const _fromStation = selectedTrain.getAttribute('data-from');
        const _toStation = selectedTrain.getAttribute('data-to');

        // 创建火车行程的事件
        const trainEvent = {
            "start_time": departureTime,   // 出发时间
            "end_time": arrivalTime,       // 到达时间
            "date": departureDate,         // 出发日期
            "title": trainNo,              // 车次号
            "details": `${_fromStation} 到 ${_toStation}`  // 出发站和到达站
        };

        // 将事件保存到浏览器的 localStorage
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(trainEvent);
        localStorage.setItem('events', JSON.stringify(events));

        window.location.href = `../select_back_train/index.html?from_station=${fromStation}&to_station=${toStation}&departure=${departureDate}&back=${backDate}`;
    } else {
        alert('请选择一个车次');
    }
});
