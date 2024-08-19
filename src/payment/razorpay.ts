import { conf } from "./razorconfig";



export class RazorpayPayment {
    constructor() { }

    async createOrder(order) {
        const Razorpay = require('razorpay');
        const instance = new Razorpay(conf);
        let o: any;

        await instance.orders.create({
            amount: order.amount * 100,
            currency: 'USD',
            receipt: order.receipt
        }, function (err, ord) {
            if (err)
                console.log(err)
            o = ord;
        });
        return o;
    }
}