/*
Cart constructor. It will take the old object if there is one otherwise
creates new cart. Add function add new item to cart.
*/

module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.totalPrice = roundToTwoDecimals(this.totalPrice);

    this.add = function(item, id) {
        var storedItem = this.items[id];
        if (!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        storedItem.price = roundToTwoDecimals(storedItem.price);
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
        this.totalPrice = roundToTwoDecimals(this.totalPrice);
    };

    this.decreaseQty = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.items[id].price = roundToTwoDecimals(this.items[id].price);
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if(this.items[id].qty <= 0) {
            delete this.items[id];
        }
        this.totalPrice = roundToTwoDecimals(this.totalPrice);

    };

    this.increaseQty = function(id) {
        this.items[id].qty++;
        this.items[id].price += this.items[id].item.price;
        this.items[id].price = roundToTwoDecimals(this.items[id].price);
        this.totalQty++;
        this.totalPrice += this.items[id].item.price;
        this.totalPrice = roundToTwoDecimals(this.totalPrice);

    };

    this.generateArray = function () {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};

function roundToTwoDecimals(value) {
    return Number(Math.round(value+'e2')+'e-2');
}