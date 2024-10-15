// show_food.js

document.addEventListener('DOMContentLoaded', () => {
    const foodsContainer = document.getElementById('foods-container');
    const paginationContainer = document.getElementById('pagination');
    const listView = document.getElementById('list-view');
    const detailsView = document.getElementById('details-view');
    const loadingInitial = document.getElementById('loading');
    const overlay = document.getElementById('overlay');

    const backButton = document.getElementById('back-button');
    const confirmButton = document.getElementById('confirm-button');

    // 详情视图中的元素
    const detailImage = document.getElementById('detail-image');
    const detailName = document.getElementById('detail-name');
    const detailTags = document.getElementById('detail-tags');
    const detailRating = document.getElementById('detail-rating');
    const detailReviews = document.getElementById('detail-reviews');
    const detailPrice = document.getElementById('detail-price');
    const detailDescription = document.getElementById('detail-description');
    const externalLink = document.getElementById('external-link');

    // 当前选中的美食
    let currentFood = null;

    // 获取 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get("country") || "重庆";
    let pageIndex = 1; // 当前页码
    let isLoading = false; // 是否正在加载数据
    let hasMore = true; // 是否还有更多数据

    // 初始化 IntersectionObserver
    const sentinel = document.getElementById('sentinel');
    const observer = new IntersectionObserver(handleIntersect, {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 1.0
    });
    observer.observe(sentinel);

    // 初始加载数据
    fetchFoods(pageIndex);

    /**
     * 处理 IntersectionObserver 的回调
     * @param {IntersectionObserverEntry[]} entries
     */
    function handleIntersect(entries) {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
            console.log('Sentinel is intersecting. Fetching next page.');
            fetchFoods(pageIndex + 1);
        }
    }

    /**
     * 获取美食数据并渲染
     * @param {number} page
     */
    function fetchFoods(page) {
        if (isLoading) return; // 防止重复请求
        isLoading = true;
        showOverlay();
        console.log(`Fetching page ${page} data...`);

        fetch(`http://localhost:9999/get_food?country=${encodeURIComponent(country)}&pageIndex=${page}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Page ${page} data fetched successfully.`);
                const foods = data.food;
                const keys = Object.keys(foods);
                if (keys.length === 0) {
                    hasMore = false;
                    // 显示“没有更多数据”的提示
                    const endMessage = document.createElement('p');
                    endMessage.className = 'text-center my-4';
                    endMessage.textContent = '没有更多美食了。';
                    listView.appendChild(endMessage);
                    console.log('No more data to load.');
                    hideOverlay();
                    isLoading = false;
                    return;
                }

                // 遍历每个美食并创建卡片
                keys.forEach(foodId => {
                    const food = foods[foodId];
                    const card = createFoodCard(food);
                    foodsContainer.appendChild(card);
                });

                pageIndex = page;

                // 如果是第一页，隐藏初始加载指示器
                if (page === 1) {
                    loadingInitial.classList.add('d-none');
                }

                // 显示美食容器
                foodsContainer.classList.remove('d-none');

                hideOverlay();
                isLoading = false;

                // 如果后端可以提供是否有更多数据的信息，可以在这里更新 hasMore
            })
            .catch(error => {
                hideOverlay();
                isLoading = false;
                console.error('Error fetching foods data:', error);
                // 可以在这里显示错误提示
                const errorMessage = document.createElement('p');
                errorMessage.className = 'text-center text-danger my-4';
                errorMessage.textContent = '加载数据失败，请稍后再试。';
                listView.appendChild(errorMessage);
            });
    }

    /**
     * 创建美食卡片元素
     * @param {Object} food - 美食信息对象
     * @returns {HTMLElement} - 卡片元素
     */
    function createFoodCard(food) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card food-card h-100 shadow-sm';

        // 图片
        const img = document.createElement('img');
        img.src = food.cover_image_url || 'https://via.placeholder.com/1080x808?text=No+Image';
        img.className = 'card-img-top';
        img.alt = food.name;
        img.loading = 'lazy'; // 添加懒加载
        card.appendChild(img);

        // 卡片主体
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        // 标题
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = food.name;
        cardBody.appendChild(title);

        // 评分和点评数
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'mb-2';

        // 星级评分
        const starRating = document.createElement('div');
        starRating.className = 'star-rating';
        const rating = parseFloat(food.rating) || 0;
        const fullStars = Math.floor(rating);
        const halfStar = (rating - fullStars) >= 0.5;
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.className = 'bi bi-star-fill';
            starRating.appendChild(star);
        }
        if (halfStar) {
            const star = document.createElement('i');
            star.className = 'bi bi-star-half';
            starRating.appendChild(star);
        }
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            const star = document.createElement('i');
            star.className = 'bi bi-star';
            starRating.appendChild(star);
        }
        ratingDiv.appendChild(starRating);

        // 点评数
        const reviews = document.createElement('small');
        reviews.className = 'text-muted';
        reviews.textContent = `${food.review_count}条点评`;
        ratingDiv.appendChild(reviews);

        cardBody.appendChild(ratingDiv);

        // 标签（菜系）
        const tagsDiv = document.createElement('div');
        food.cuisines?.forEach(cuisineName => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = cuisineName;
            tagsDiv.appendChild(tag);
        });
        cardBody.appendChild(tagsDiv);

        // 空间填充
        const spacer = document.createElement('div');
        spacer.className = 'mt-auto';
        cardBody.appendChild(spacer);

        // 查看详情按钮
        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.className = 'btn btn-primary mt-3';
        viewDetailsButton.textContent = '查看详情';
        viewDetailsButton.addEventListener('click', () => {
            showDetailsView(food);
        });
        cardBody.appendChild(viewDetailsButton);

        card.appendChild(cardBody);
        col.appendChild(card);

        return col;
    }

    /**
     * 显示详情视图并填充相关信息
     * @param {Object} food - 选定的美食信息对象
     */
    function showDetailsView(food) {
        console.log('Showing details for:', food);
        currentFood = food; // 设置当前选中的美食

        // 填充详情信息
        detailImage.src = food.cover_image_url || 'https://via.placeholder.com/1080x808?text=No+Image';
        detailImage.alt = food.name;
        detailName.textContent = food.name;

        // 填充标签（菜系）
        detailTags.innerHTML = '';
        food.cuisines?.forEach(cuisineName => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-info text-dark me-1';
            badge.textContent = cuisineName;
            detailTags.appendChild(badge);
        });

        // 填充评分
        detailRating.textContent = food.rating || '暂无评分';

        // 填充点评数
        detailReviews.textContent = `${food.review_count}条点评`;

        // 填充价格
        detailPrice.textContent = food.price ? `价格：${food.price}` : '价格未标明';

        // 填充描述（如果有的话）
        detailDescription.textContent = food.reviews?.join('\n') || '暂无描述。';

        // 设置外部链接
        externalLink.href = `https://www.tripadvisor.cn/${food.url}`;
        externalLink.target = '_blank'; // 在新标签页中打开

        // 设置“确认”按钮的数据属性
        confirmButton.dataset.title = food.name;
        confirmButton.dataset.details = food.reviews?.join('\n') || '无详情';

        // 显示详情视图，隐藏列表视图
        listView.classList.add('d-none');
        detailsView.classList.remove('d-none');
    }

    /**
     * 显示加载蒙层
     */
    function showOverlay() {
        console.log('Showing overlay.');
        overlay.classList.remove('d-none');
    }

    /**
     * 隐藏加载蒙层
     */
    function hideOverlay() {
        console.log('Hiding overlay.');
        overlay.classList.add('d-none');
    }

    // 处理“确认”按钮点击事件
    confirmButton.addEventListener('click', () => {
        if (!currentFood) {
            alert('未选择任何美食。');
            return;
        }

        const title = currentFood.name;
        const details = currentFood.reviews?.join('\n') || '无详情';

        // 获取当前页面的所有 URL 参数
        const currentParams = new URLSearchParams(window.location.search);

        // 添加 title 和 details 到参数中
        currentParams.set('title', title);
        currentParams.set('details', details);

        // 构建新的 URL
        const currentUrl = window.location.origin + window.location.pathname;
        const newUrl = `${currentUrl}?${currentParams.toString()}`;

        // 跳转到 set_params.html，并传递所有参数
        window.location.href = `../set_params/index.html?${currentParams.toString()}`;
    });

    // 处理“返回”按钮点击事件
    backButton.addEventListener('click', () => {
        detailsView.classList.add('d-none');
        listView.classList.remove('d-none');
    });

});
