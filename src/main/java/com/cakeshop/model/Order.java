package com.cakeshop.model;

import java.util.List;

public class Order {
    private String orderId;
    private List<CartItem> items;
    private double total;
    private String qrCodeUrl;
    private String status;

    public Order() {}

    public Order(String orderId, List<CartItem> items, double total, String qrCodeUrl, String status) {
        this.orderId = orderId;
        this.items = items;
        this.total = total;
        this.qrCodeUrl = qrCodeUrl;
        this.status = status;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
