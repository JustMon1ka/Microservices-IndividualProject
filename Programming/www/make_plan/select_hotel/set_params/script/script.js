document.getElementById('params-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);

    const country = document.getElementById('country').value;
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const adultNum = document.getElementById('adultNum').value;
    const childNum = document.getElementById('childNum').value;
    const roomNum = document.getElementById('roomNum').value;

    // 将参数附加到URL进行跳转
    window.location.href = `../select_hotel/index.html?country=${country}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adultNum=${adultNum}&childNum=${childNum}&roomNum=${roomNum}&${urlParams.toString()}`;
});

document.getElementById('back-btn').addEventListener('click', function (event){
    event.preventDefault();

    window.history.back();
})