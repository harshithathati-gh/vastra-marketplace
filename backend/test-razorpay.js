const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function test() {
    await mongoose.connect("mongodb+srv://myAtlasDBUser:vastra2609@myatlasclusteredu.iw5um.mongodb.net/vastra?appName=myAtlasClusterEDU");
    try {
        const order = await Order.findById('6ab16f99c4356a8d1365c4c6');
        if (!order) return console.log("Order not found!");

        console.log("Order found:", order._id);
        console.log("Total amount:", order.totalAmount);

        order.payments.push({
            razorpayOrderId: 'fake_razorpay_id',
            amount: order.totalAmount,
            type: 'escrow',
            status: 'created',
        });
        await order.save();
        console.log("Save successful!");
    } catch (e) {
        console.error("Crash during save:", e.message);
        console.error(e.stack);
    }
    process.exit();
}
test();
