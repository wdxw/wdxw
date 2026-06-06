package com.cakeshop.model;

public class CartItem {
    private Cake cake;
    private int quantity;

    public CartItem() {}

    public CartItem(Cake cake, int quantity) {
        this.cake = cake;
        this.quantity = quantity;
    }

    public Cake getCake() {
        return cake;
    }

    public void setCake(Cake cake) {
        this.cake = cake;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getSubtotal() {
        return cake.getPrice() * quantity;
    }
}
