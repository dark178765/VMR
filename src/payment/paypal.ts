import { prod_paypalconfig, test_paypalconfig } from "./paypalconfig";

export class PaypalPayment {

    constructor(isTest = true) {
        this.paypalconfig = this.isTest ? test_paypalconfig : prod_paypalconfig;
        isTest = isTest;
    }

    paypalconfig: any;
    isTest = false;

    getPaypalClient(isTest: boolean = false) {
        const paypal = require('@paypal/checkout-server-sdk');
        //let env = new paypal.core.SandboxEnvironment(paypalconfig.client_id, paypalconfig.client_secret);
        let env = !isTest ? new paypal.core.LiveEnvironment(this.paypalconfig.client_id, this.paypalconfig.client_secret) :
            new paypal.core.SandboxEnvironment(this.paypalconfig.client_id, this.paypalconfig.client_secret);
        let client = new paypal.core.PayPalHttpClient(env);

        return client;
    }

    async createOrder(order) {
        const paypal = require('@paypal/checkout-server-sdk');

        let client = this.getPaypalClient(this.isTest);

        let createOrderRequest = new paypal.orders.OrdersCreateRequest();
        createOrderRequest.requestBody({
            "intent": "CAPTURE",
            "application_context": {
                "return_url": `${this.paypalconfig.returnurl}?buynowid=${order.buynowId}`,
                "cancel_url": `${this.paypalconfig.cancel_url}?buynowid=${order.buynowId}`,
                "brand_name": `${this.paypalconfig.brand_name}`,
                "locale": "en-US",
                "landing_page": "BILLING",
                "user_action": "CONTINUE"
            },
            "purchase_units": [
                {
                    "reference_id": `${order.order_id}`,
                    "description": `${order.title.substring(0, 20)}`,
                    "soft_descriptor": `${order.title.substring(0, 20)}`,
                    "amount": {
                        "currency_code": "USD",
                        "value": `${order.amount}`
                    }
                }
            ]
        });

        let createOrder = await client.execute(createOrderRequest);

        return createOrder;

    }

    async validatePayment(orderId) {
        const paypal = require('@paypal/checkout-server-sdk');

        let client = this.getPaypalClient(this.isTest);

        let orderGetRequest = new paypal.orders.OrdersGetRequest(orderId);
        let orderDetail = await client.execute(orderGetRequest);

        if (orderDetail.result.status !== 'COMPLETED' && orderDetail.result.status !== 'APPROVED') {
            return {
                status: orderDetail.result.status
            }
        }
        let request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        let response = await client.execute(request);

        return response.result;
    }

    getClientID() {
        return this.isTest ? test_paypalconfig.client_id : prod_paypalconfig.client_id;
    }
}