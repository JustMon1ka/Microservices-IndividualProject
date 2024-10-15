// set_params.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title') || '未知美食';
    const details = urlParams.get('details') || '无详情';

    // 获取其他参数（如 country）
    urlParams.delete('title');
    urlParams.delete('details');
    const otherParams = urlParams.toString();

    // 填充美食名称和详情
    document.getElementById('foodTitle').value = title;
    document.getElementById('foodDetails').value = details;

    const form = document.getElementById('setParamsForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const visitDate = document.getElementById('visitDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        if (!visitDate || !startTime || !endTime) {
            alert('请填写所有必填字段。');
            return;
        }

        // 验证开始时间是否早于结束时间
        if (startTime >= endTime) {
            alert('开始时间必须早于结束时间。');
            return;
        }

        // 构建日期字符串
        const dateObj = new Date(visitDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // 构建事件对象
        const eventObj = {
            "start_time": startTime,
            "end_time": endTime,
            "date": formattedDate,
            "title": title,
            "details": details
        };

        console.log('Adding event:', eventObj);

        // 获取现有的 events 列表
        let events = JSON.parse(localStorage.getItem('events')) || [];

        // 添加新的事件
        events.push(eventObj);

        // 保存回 localStorage
        try {
            localStorage.setItem('events', JSON.stringify(events));
            console.log('Event added successfully.');
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            alert('保存行程失败，请稍后再试。');
            return;
        }

        // 显示成功消息
        successMessage.classList.remove('d-none');

        // 重置表单
        form.reset();

        // 跳转回 index.html 并保持原有参数
        setTimeout(() => {
            window.location.href = otherParams ? `../../main_screen/index.html?${otherParams}` : '../../main_screen/index.html';
        }, 2000); // 2秒后跳转
    });

    // 处理“返回”按钮点击事件
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        window.history.back();
    });
});
