const API_BASE = '/api';

let cartVisible = false;
// 加载页面即实现，相关功能
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

// 实现点击购物车列表，呼出购物车面板
function toggleCart() {
    cartVisible = !cartVisible;
    // 寻找前端的id= cartOverlay 的元素
    // 切换类名 active，实现购物车面板的显示与隐藏
    document.getElementById('cartOverlay').classList.toggle('active', cartVisible);
    // 寻找前端的id= cartPanel 的元素
    // 切换类名 active，实现购物车面板的显示与隐藏
    document.getElementById('cartPanel').classList.toggle('active', cartVisible);
    // 呼出购物车面板时，进行刷新
    if (cartVisible) {
        loadCart();
    }
}
// 异步函数，用于加载商品列表
async function loadProducts() {
    try {
        // 发送GET请求，获取商品列表
        const response = await fetch(API_BASE + '/cakes');
        // 将响应数据转换为json格式
        const cakes = await response.json();
        // 渲染商品卡片
        renderProducts(cakes);
    } catch (error) {
        // 打印错误信息 控制台直接相应文本信息
        console.error('加载商品失败:', error);
    }
}
//参数本就是json格式
function renderProducts(cakes) {
    //塞入商品列表，在productGrid中 渲染商品卡片
    const grid = document.getElementById('productGrid');
    //在前端中塞入标签信息
    grid.innerHTML = cakes.map(cake => `
        <div class="product-card">
            <img class="product-image" src="${cake.image}" alt="${cake.name}" loading="lazy">
            <div class="product-info">
                <div class="product-name">${cake.name}</div>
                <div class="product-desc">${cake.description}</div>
                <div class="product-bottom">
                    <span class="product-price">${cake.price.toFixed(2)}</span>
                    <button class="btn-add" onclick="addToCart(${cake.id}, this)">
                        🛒 加入购物车
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
// 点击前端渲染的商品列表时，点击加入购物车图标时，触发该函数
async function addToCart(cakeId, button) {
    try {
        //接收后端返回的响应数据，将参数 cakeId 作为查询参数传递
        const response = await fetch(API_BASE + '/cart/add?cakeId=' + cakeId, {
            method: 'POST'
        });
        //将键值对，转换为json格式
        const data = await response.json();
        if (data.success) {
            showToast('✅ ' + data.message);
            updateCartBadge(data.cartCount);
            // 添加类名，命中css文件，导致按钮变色
            button.classList.add('btn-added');
            // 改变按钮文本为已加入
            // 1.5秒后，移除类名，恢复按钮文本为加入购物车
            button.textContent = '✓ 已加入';
            setTimeout(() => {
                button.classList.remove('btn-added');
                button.textContent = '🛒 加入购物车';
            }, 1500);
        }
    } catch (error) {
        console.error('添加购物车失败:', error);
        showToast('❌ 操作失败，请重试');
    }
}

async function loadCart() {
    try {
        // 发送GET请求，获取购物车列表
        const response = await fetch(API_BASE + '/cart');
        // 将响应数据转换为json格式
        const data = await response.json();
        renderCart(data.items, data.total);
        updateCartBadge(data.items ? data.items.length : 0);
    } catch (error) {
        console.error('加载购物车失败:', error);
    }
}

function renderCart(items, total) {
    // 寻找这三种标签对应的元素
    const cartItemsEl = document.getElementById('cartItems');
    const cartFooterEl = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');
    // 如果购物车为空，显示提示信息
    // 否则，显示购物车列表和总金额
    if (!items || items.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty">购物车是空的，快去挑选美味的蛋糕吧~</div>';
        cartFooterEl.style.display = 'none';
        return;
    }

    cartFooterEl.style.display = 'block';
    cartTotalEl.textContent = '¥' + total.toFixed(2);

    cartItemsEl.innerHTML = items.map(item => `
        <div class="cart-item">
            <img class="cart-item-image" src="${item.cake.image}" alt="${item.cake.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.cake.name}</div>
                <span class="cart-item-price">¥${item.cake.price.toFixed(2)}</span>
                <span class="cart-item-quantity">× ${item.quantity}</span>
            </div>
            <div class="cart-item-subtotal">¥${item.subtotal.toFixed(2)}</div>
        </div>
    `).join('');
}

function updateCartBadge(count) {
    document.getElementById('cartBadge').textContent = count;
}

async function clearCart() {
    try {
        await fetch(API_BASE + '/cart/clear', { method: 'DELETE' });
        // 清空购物车后，重新加载购物车列表
        loadCart();
        showToast('🗑️ 购物车已清空');
    } catch (error) {
        console.error('清空购物车失败:', error);
    }
}
// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ========== 结算与支付功能 ==========

let currentOrderId = null;

/**
 * 结算：发送当前购物车到后端生成订单，弹出支付弹窗
 */
async function checkout() {
    try {
        const response = await fetch(API_BASE + '/order/checkout', { method: 'POST' });
        const data = await response.json();

        if (!data.success) {
            showToast('❌ ' + data.message);
            return;
        }

        const order = data.order;
        currentOrderId = order.orderId;

        // 填充订单信息
        document.getElementById('payOrderId').textContent = order.orderId;
        document.getElementById('payOrderAmount').textContent = '¥' + order.total.toFixed(2);

        // 渲染订单商品清单
        document.getElementById('payItems').innerHTML = order.items.map(item => `
            <div class="pay-item-row">
                <span class="pay-item-name">${item.cake.name}</span>
                <span class="pay-item-qty">× ${item.quantity}</span>
                <span class="pay-item-row-subtotal">¥${item.subtotal.toFixed(2)}</span>
            </div>
        `).join('');

        // 生成模拟二维码
        drawQRCode(order);

        // 显示支付弹窗
        document.getElementById('payOverlay').classList.add('active');
        document.getElementById('btnPayConfirm').disabled = false;
        document.getElementById('btnPayConfirm').textContent = '确认支付';
    } catch (error) {
        console.error('结算失败:', error);
        showToast('❌ 结算失败，请重试');
    }
}

/**
 * 在 Canvas 上绘制模拟二维码图案
 */
function drawQRCode(order) {
    const canvas = document.getElementById('qrcodeCanvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // 白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // 用订单号生成一个伪随机种子
    const seed = order.orderId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);

    // 绘制二维码定位图案（三个角）
    drawPositionMarker(ctx, 20, 20, 40);
    drawPositionMarker(ctx, size - 60, 20, 40);
    drawPositionMarker(ctx, 20, size - 60, 40);

    // 绘制随机二维码数据块（模拟）
    const moduleSize = 4;
    const margin = 50;
    const cols = Math.floor((size - margin * 2) / moduleSize);
    const rows = Math.floor((size - margin * 2) / moduleSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = margin + col * moduleSize;
            const y = margin + row * moduleSize;

            // 跳过定位图案区域
            if (x < 80 && y < 80) continue;
            if (x > size - 100 && y < 80) continue;
            if (x < 80 && y > size - 100) continue;

            // 基于 seed 的伪随机填充
            const pseudoRandom = ((seed * (row * 31 + col * 17 + 1)) % 100);
            if (pseudoRandom > 45) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
            }
        }
    }

    // 中心绘制小图标
    const centerX = size / 2;
    const centerY = size / 2;
    const iconSize = 28;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize);
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('付', centerX, centerY);
}

/**
 * 绘制二维码定位图案
 */
function drawPositionMarker(ctx, x, y, size) {
    const s = size;
    // 外框
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, s, s);
    // 白色框
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
    // 内核
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 8, s - 16, s - 16);
}

/**
 * 关闭支付弹窗
 */
function closePayModal() {
    document.getElementById('payOverlay').classList.remove('active');
}

/**
 * 确认支付
 */
async function confirmPay() {
    const btn = document.getElementById('btnPayConfirm');
    btn.disabled = true;
    btn.textContent = '支付中...';

    try {
        const response = await fetch(API_BASE + '/pay/confirm?orderId=' + currentOrderId, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            btn.textContent = '✓ 支付成功';
            btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
            showToast('✅ 支付成功！感谢您的购买');

            // 延迟关闭弹窗并刷新
            setTimeout(() => {
                closePayModal();
                loadCart();
                updateCartBadge(0);
            }, 1500);
        } else {
            btn.disabled = false;
            btn.textContent = '确认支付';
            showToast('❌ 支付失败，请重试');
        }
    } catch (error) {
        console.error('支付失败:', error);
        btn.disabled = false;
        btn.textContent = '确认支付';
        showToast('❌ 支付失败，请重试');
    }
}
