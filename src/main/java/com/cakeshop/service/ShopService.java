package com.cakeshop.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;

import com.cakeshop.model.Cake;
import com.cakeshop.model.CartItem;
import com.cakeshop.model.Order;

@Service
public class ShopService {

    private final List<Cake> cakeList = new ArrayList<>();
    private final List<CartItem> cart = new ArrayList<>();

    @PostConstruct
    public void initCakes() {
        cakeList.add(new Cake(1, "草莓奶油蛋糕", 128.00, "/images/cake1.svg", "新鲜草莓搭配香滑奶油，酸甜可口"));
        cakeList.add(new Cake(2, "巧克力慕斯蛋糕", 158.00, "/images/cake2.svg", "比利时黑巧克力制作，浓郁丝滑"));
        cakeList.add(new Cake(3, "芒果千层蛋糕", 138.00, "/images/cake3.svg", "层层芒果与奶油交织，果香四溢"));
        cakeList.add(new Cake(4, "提拉米苏", 108.00, "/images/cake4.svg", "经典意式甜点，咖啡与奶油的完美融合"));
        cakeList.add(new Cake(5, "蓝莓芝士蛋糕", 148.00, "/images/cake5.svg", "酸甜蓝莓遇见浓郁芝士，回味无穷"));
        cakeList.add(new Cake(6, "抹茶红豆蛋糕", 118.00, "/images/cake6.svg", "日式抹茶搭配甜蜜红豆，清新淡雅"));
        cakeList.add(new Cake(7, "黑森林蛋糕", 138.00, "/images/cake7.svg", "樱桃与巧克力的经典搭配，德国传统风味"));
        cakeList.add(new Cake(8, "红丝绒蛋糕", 168.00, "/images/cake8.svg", "天鹅绒般细腻口感，搭配奶油芝士霜"));
    }

    public List<Cake> getAllCakes() {
        return cakeList;
    }

    public Cake getCakeById(int id) {
        for (Cake cake : cakeList) {
            if (cake.getId() == id) {
                return cake;
            }
        }
        return null;
    }

    public void addToCart(int cakeId) {
        Cake cake = getCakeById(cakeId);
        if (cake == null) {
            return;
        }
        for (CartItem item : cart) {
            if (item.getCake().getId() == cakeId) {
                item.setQuantity(item.getQuantity() + 1);
                return;
            }
        }
        cart.add(new CartItem(cake, 1));
    }

    public List<CartItem> getCart() {
        return cart;
    }

    public void clearCart() {
        cart.clear();
    }

    /**
     * 结算：生成订单，返回订单对象（含模拟二维码支付链接）
     */
    public Order checkout() {
        if (cart.isEmpty()) {
            return null;
        }
        // 深拷贝购物车内容到订单，避免后续清空影响订单数据
        List<CartItem> orderItems = new ArrayList<>();
        double total = 0;
        for (CartItem item : cart) {
            orderItems.add(new CartItem(item.getCake(), item.getQuantity()));
            total += item.getSubtotal();
        }
        // 生成模拟订单编号
        String orderId = "CS" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        // 生成模拟二维码数据（使用 API 端点路径）
        String qrCodeUrl = "/api/pay/qrcode?orderId=" + orderId + "&amount=" + total;
        return new Order(orderId, orderItems, total, qrCodeUrl, "待支付");
    }
}
