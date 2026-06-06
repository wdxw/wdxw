package com.cakeshop.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cakeshop.model.Cake;
import com.cakeshop.model.CartItem;
import com.cakeshop.model.Order;
import com.cakeshop.service.ShopService;

@RestController
@RequestMapping("/api")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/cakes")
    public List<Cake> getAllCakes() {
        return shopService.getAllCakes();
    }

    @PostMapping("/cart/add")
    public Map<String, Object> addToCart(@RequestParam int cakeId) {
        shopService.addToCart(cakeId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已加入购物车");
        result.put("cartCount", shopService.getCart().size());
        return result;
    }

    @GetMapping("/cart")
    public Map<String, Object> getCart() {
        List<CartItem> cartItems = shopService.getCart();
        double total = 0;
        for (CartItem item : cartItems) {
            total += item.getSubtotal();
        }
        Map<String, Object> result = new HashMap<>();
        result.put("items", cartItems);
        result.put("total", total);
        return result;
    }

    @DeleteMapping("/cart/clear")
    public Map<String, Object> clearCart() {
        shopService.clearCart();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "购物车已清空");
        return result;
    }

    /**
     * 结算下单：根据当前购物车生成订单，返回订单详情及模拟二维码链接
     */
    @PostMapping("/order/checkout")
    public Map<String, Object> checkout() {
        Map<String, Object> result = new HashMap<>();
        Order order = shopService.checkout();
        if (order == null) {
            result.put("success", false);
            result.put("message", "购物车为空，无法结算");
            return result;
        }
        result.put("success", true);
        result.put("message", "订单已生成，请扫码支付");
        result.put("order", order);
        return result;
    }

    /**
     * 确认支付：模拟支付成功，清空购物车
     */
    @PostMapping("/pay/confirm")
    public Map<String, Object> confirmPay(@RequestParam String orderId) {
        shopService.clearCart();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "支付成功！感谢您的购买，订单号：" + orderId);
        return result;
    }
}
