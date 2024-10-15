document.getElementById('travel-form').addEventListener('submit', function(event) {
    localStorage.clear();
    event.preventDefault();  // 防止表单默认提交行为

    // 获取用户输入的出发地、目的地和出发日期
    const fromStation = document.getElementById('from_station').value;
    const toStation = document.getElementById('to_station').value;
    const departureDate = document.getElementById('departure').value;
    const backDate = document.getElementById('back').value;

    // 构造 URL 并跳转到火车票选择页面，同时传递用户输入的参数
    window.location.href = `../select_departure_train/index.html?from_station=${fromStation}&to_station=${toStation}&departure=${departureDate}&back=${backDate}`;
});
