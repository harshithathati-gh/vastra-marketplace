const Order = require('../models/Order');
const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const PlatformSettings = require('../models/PlatformSettings');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { 
    sendOrderPlacedEmail,
    sendTailorNewOrderEmail,
    sendOrderQuotedEmail,
    sendOrderConfirmationEmail, 
    sendOrderStatusUpdateEmail,
    sendSmsOrWhatsApp 
} = require('../services/notificationService');

// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
    try {
        const { tailorId, measurementProfileName, fabricPreference, specialInstructions, deliveryType, preferredDeliveryDate } = req.body;

        // When using FormData, complex objects come as strings. We must parse them if necessary.
        let product = typeof req.body.product === 'string' ? JSON.parse(req.body.product) : req.body.product;
        const measurements = typeof req.body.measurements === 'string' ? JSON.parse(req.body.measurements) : req.body.measurements;
        let deliveryAddress = typeof req.body.deliveryAddress === 'string' ? JSON.parse(req.body.deliveryAddress) : (req.body.deliveryAddress || {});

        if (deliveryType === 'self_pickup') {
            deliveryAddress = {
                street: deliveryAddress.street || 'Self Pickup at Tailor Workshop',
                city: deliveryAddress.city || 'Self Pickup',
                state: deliveryAddress.state || 'N/A',
                pincode: deliveryAddress.pincode || '000000',
            };
        }

        // Handle Cloudinary file uploads
        if (req.files && req.files.length > 0) {
            product.referenceImages = req.files.map(file => file.path);
        }

        // Verify tailor exists and is approved
        const tailor = await TailorProfile.findOne({ userId: tailorId, verificationStatus: 'approved', isActive: true });
        if (!tailor) {
            return res.status(400).json({ success: false, message: 'Tailor not found or not verified' });
        }

        const order = await Order.create({
            customerId: req.user._id,
            tailorId,
            product,
            measurements,
            measurementProfileName,
            fabricPreference,
            specialInstructions,
            deliveryAddress,
            deliveryType,
            preferredDeliveryDate,
            status: 'placed',
            statusHistory: [{ status: 'placed', note: 'Order placed by customer' }],
        });

        // Notify tailor via socket if online
        const io = req.app.get('io');
        io.to(`user_${tailorId}`).emit('newOrder', { orderId: order._id, message: 'New order received!' });

        // Dispatch Email & SMS notifications asynchronously
        (async () => {
            try {
                const tailorUser = await User.findById(tailorId);
                const customerUser = req.user;

                // 1. Send Order Confirmation Email & SMS to Customer
                if (customerUser?.email) {
                    sendOrderPlacedEmail({
                        to: customerUser.email,
                        customerName: customerUser.name,
                        order,
                        tailorName: tailorUser?.name || 'Master Tailor'
                    }).catch(e => console.error('[Order Email Error]', e.message));
                }
                if (customerUser?.phone) {
                    sendSmsOrWhatsApp({
                        phone: customerUser.phone,
                        message: `Namaste ${customerUser.name}! Your Vastra order #${order._id.toString().slice(-6).toUpperCase()} for "${order.product?.name}" has been placed. We will notify you once tailor ${tailorUser?.name || ''} confirms.`
                    }).catch(e => console.error('[Order SMS Error]', e.message));
                }

                // 2. Send New Order Alert Email & SMS to Tailor
                if (tailorUser?.email) {
                    sendTailorNewOrderEmail({
                        to: tailorUser.email,
                        tailorName: tailorUser.name,
                        order,
                        customerName: customerUser?.name || 'Customer'
                    }).catch(e => console.error('[Tailor Email Error]', e.message));
                }
                if (tailorUser?.phone) {
                    sendSmsOrWhatsApp({
                        phone: tailorUser.phone,
                        message: `Namaste ${tailorUser.name}! New custom tailoring order #${order._id.toString().slice(-6).toUpperCase()} received from ${customerUser?.name || 'Customer'}. Review and accept on your Vastra dashboard.`
                    }).catch(e => console.error('[Tailor SMS Error]', e.message));
                }
            } catch (notifyErr) {
                console.error('[Notification Trigger Error]', notifyErr.message);
            }
        })();

        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};

        // Show orders based on role
        if (req.user.role === 'customer') {
            filter.customerId = req.user._id;
        } else if (req.user.role === 'tailor') {
            filter.tailorId = req.user._id;
        }

        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('customerId', 'name email phone avatar location')
            .populate('tailorId', 'name email phone avatar location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            orders,
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email phone avatar location')
            .populate('tailorId', 'name email phone avatar location');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only allow customer or tailor of this order (or admin)
        if (req.user.role !== 'admin' &&
            order.customerId._id.toString() !== req.user._id.toString() &&
            order.tailorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { 
            status, 
            note, 
            trackingNumber, 
            courierPartner, 
            trackingUrl, 
            estimatedDelivery,
            fabricPickupStatus,
            fabricPickupTrackingNumber,
            fabricPickupCourier
        } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only tailor can update status (except customer cancellation)
        if (req.user.role === 'tailor' && order.tailorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Validate status transitions
        const validTransitions = {
            placed: ['accepted', 'rejected'],
            accepted: ['in_progress'],
            quoted: ['in_progress'],
            in_progress: ['shipped'],
            shipped: ['delivered'],
        };

        if (req.user.role === 'customer') {
            // Customer can only cancel placed orders
            if (order.status !== 'placed' || status !== 'cancelled') {
                return res.status(400).json({ success: false, message: 'You can only cancel orders that are in placed status' });
            }
        } else {
            if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
                return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
            }
        }

        order.status = status;
        order.statusHistory.push({ status, note: note || '' });

        if (status === 'rejected') order.rejectReason = req.body.rejectReason || '';
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (courierPartner) order.courierPartner = courierPartner;
        if (trackingUrl) order.trackingUrl = trackingUrl;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
        if (fabricPickupStatus) order.fabricPickupStatus = fabricPickupStatus;
        if (fabricPickupTrackingNumber) order.fabricPickupTrackingNumber = fabricPickupTrackingNumber;
        if (fabricPickupCourier) order.fabricPickupCourier = fabricPickupCourier;

        // Update tailor total orders on delivery
        if (status === 'delivered') {
            await TailorProfile.findOneAndUpdate(
                { userId: order.tailorId },
                { $inc: { totalOrders: 1 } }
            );
        }

        await order.save();

        // Notify via socket
        const io = req.app.get('io');
        const targetUserId = req.user.role === 'tailor' ? order.customerId : order.tailorId;
        io.to(`user_${targetUserId}`).emit('orderUpdate', {
            orderId: order._id,
            status,
            message: `Order status updated to ${status}`,
        });

        // Dispatch Email & SMS notifications asynchronously to the customer
        (async () => {
            try {
                const customerUser = await User.findById(order.customerId);
                const tailorUser = await User.findById(order.tailorId);
                const orderNum = order._id.toString().slice(-6).toUpperCase();

                if (customerUser?.email) {
                    sendOrderStatusUpdateEmail({
                        to: customerUser.email,
                        customerName: customerUser.name,
                        order,
                        newStatus: status,
                        tailorName: tailorUser?.name,
                        note,
                        trackingInfo: status === 'shipped' ? {
                            courierPartner: order.courierPartner,
                            trackingNumber: order.trackingNumber,
                            trackingUrl: order.trackingUrl
                        } : null
                    }).catch(e => console.error('[Status Email Error]', e.message));
                }

                if (customerUser?.phone) {
                    let smsMsg = `Namaste ${customerUser.name}! Order #${orderNum} update: `;
                    if (status === 'accepted') {
                        smsMsg += `Tailor ${tailorUser?.name || 'Master Tailor'} accepted your custom order!`;
                    } else if (status === 'in_progress') {
                        smsMsg += `Stitching has begun! Your outfit is currently being tailored.`;
                    } else if (status === 'shipped') {
                        smsMsg += `Your outfit has been dispatched via ${order.courierPartner || 'Courier'} (Tracking #${order.trackingNumber || 'Available in Dashboard'}). Track: ${order.trackingUrl || 'https://vastra-marketplace.vercel.app/dashboard/orders/' + order._id}`;
                    } else if (status === 'delivered') {
                        smsMsg += `Your order has been delivered! We hope you love the fit. Rate your tailor in your dashboard.`;
                    } else if (status === 'rejected') {
                        smsMsg += `The tailor was unable to accept your request at this time.`;
                    } else if (status === 'cancelled') {
                        smsMsg += `Your order has been cancelled.`;
                    } else {
                        smsMsg += `Status updated to ${status}.`;
                    }

                    sendSmsOrWhatsApp({
                        phone: customerUser.phone,
                        message: smsMsg
                    }).catch(e => console.error('[Status SMS Error]', e.message));
                }
            } catch (err) {
                console.error('[Status Notification Error]', err.message);
            }
        })();

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/orders/:id/quote
exports.sendQuote = async (req, res, next) => {
    try {
        const { quotedPrice, shippingCost, estimatedDelivery } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.tailorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (order.status !== 'accepted' && order.status !== 'placed') {
            return res.status(400).json({ success: false, message: 'Can only quote on accepted or placed orders' });
        }

        order.quotedPrice = quotedPrice;
        order.shippingCost = shippingCost || 0;
        order.totalAmount = quotedPrice + (shippingCost || 0);
        order.estimatedDelivery = estimatedDelivery;
        order.status = 'quoted';
        order.statusHistory.push({ status: 'quoted', note: `Price quoted: ₹${quotedPrice}` });

        await order.save();

        // Notify customer via socket
        const io = req.app.get('io');
        io.to(`user_${order.customerId}`).emit('orderUpdate', {
            orderId: order._id,
            status: 'quoted',
            message: `Tailor has quoted ₹${quotedPrice} for your order`,
        });

        // Dispatch Email & SMS notifications to customer
        (async () => {
            try {
                const customerUser = await User.findById(order.customerId);
                const tailorUser = await User.findById(order.tailorId);
                const orderNum = order._id.toString().slice(-6).toUpperCase();
                const totalCost = quotedPrice + (shippingCost || 0);

                if (customerUser?.email) {
                    sendOrderQuotedEmail({
                        to: customerUser.email,
                        customerName: customerUser.name,
                        order,
                        tailorName: tailorUser?.name || 'Master Tailor',
                        quotedPrice,
                        shippingCost: shippingCost || 0,
                        estimatedDelivery
                    }).catch(e => console.error('[Quote Email Error]', e.message));
                }

                if (customerUser?.phone) {
                    sendSmsOrWhatsApp({
                        phone: customerUser.phone,
                        message: `Namaste ${customerUser.name}! Tailor ${tailorUser?.name || 'Master Tailor'} provided a quote of ₹${totalCost} for Order #${orderNum}. Review and pay via UPI on Vastra to start stitching.`
                    }).catch(e => console.error('[Quote SMS Error]', e.message));
                }
            } catch (err) {
                console.error('[Quote Notification Error]', err.message);
            }
        })();

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/orders/:id/pay
exports.initiatePayment = async (req, res, next) => {
    try {
        const { paymentType } = req.body; // 'advance' or 'balance'
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Get platform settings
        let settings = await PlatformSettings.findOne();
        if (!settings) settings = { advancePercentage: 50, commissionPercentage: 10 };

        let amount;
        if (paymentType === 'advance') {
            amount = req.body.amount || Math.round((order.totalAmount * settings.advancePercentage) / 100) || 500;
        } else if (paymentType === 'escrow') {
            amount = order.totalAmount > 0 ? order.totalAmount : (req.body.amount || 1500);
        } else {
            amount = (order.totalAmount - order.advancePaid) > 0 ? (order.totalAmount - order.advancePaid) : (req.body.amount || 500);
        }

        // Check if real or test Razorpay keys are configured
        let razorpayOrder;
        const hasLiveOrTestKey = process.env.RAZORPAY_KEY_ID && 
            process.env.RAZORPAY_KEY_SECRET && 
            !process.env.RAZORPAY_KEY_ID.includes('xxxx') &&
            process.env.RAZORPAY_KEY_ID.startsWith('rzp_');

        if (hasLiveOrTestKey) {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(amount * 100),
                    currency: 'INR',
                    receipt: `rcpt_${order._id.toString().slice(-8)}`,
                    notes: {
                        orderId: order._id.toString(),
                        customerId: order.customerId.toString(),
                        paymentType,
                    }
                });
            } catch (err) {
                console.warn('[Razorpay API Warning] Falling back to simulated order:', err.message);
                razorpayOrder = { id: `rzp_order_${order._id}_${Date.now()}` };
            }
        } else {
            razorpayOrder = { id: `rzp_order_${order._id}_${Date.now()}` };
        }

        // Store payment record
        order.payments.push({
            razorpayOrderId: razorpayOrder.id,
            amount,
            type: paymentType,
            status: 'created',
        });
        await order.save();

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_vastra',
            upiApps: ['google_pay', 'bhim', 'phonepe', 'paytm'],
            isSimulator: !hasLiveOrTestKey,
        });
    } catch (error) {
        if (error.error && error.error.description) {
            return res.status(500).json({ success: false, message: 'Razorpay API rejected: ' + error.error.description });
        }
        if (error.statusCode) {
            return res.status(500).json({ success: false, message: 'Razorpay API crashed. Code: ' + error.statusCode });
        }
        next(error);
    }
};

// @route   POST /api/orders/:id/verify-payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            paymentMethod = 'UPI (Google Pay / BHIM)'
        } = req.body;

        // Verify signature (or accept simulator bypass)
        let isAuthentic = false;

        if (razorpay_signature === 'mock_signature' || razorpay_order_id?.startsWith('rzp_order_') || razorpay_order_id?.startsWith('mock_')) {
            isAuthentic = true;
        } else if (process.env.RAZORPAY_KEY_SECRET) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');
            isAuthentic = expectedSignature === razorpay_signature;
        }

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email phone location')
            .populate('tailorId', 'name email phone location');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const payment = order.payments.find((p) => p.razorpayOrderId === razorpay_order_id);
        if (payment) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.status = 'paid';
            payment.paidAt = new Date();
            payment.method = paymentMethod;

            order.paymentMethod = paymentMethod;
            order.upiTransactionId = razorpay_payment_id;

            if (!order.invoiceNumber) {
                const year = new Date().getFullYear();
                order.invoiceNumber = `INV-${year}-${order._id.toString().slice(-6).toUpperCase()}`;
            }

            if (payment.type === 'escrow') {
                order.isEscrowFunded = true;
                order.escrowStatus = 'held';
                if (order.status === 'quoted') {
                    order.status = 'in_progress';
                    order.statusHistory.push({ status: 'in_progress', note: `100% Escrow secured via ${paymentMethod}` });
                }
            } else if (payment.type === 'advance') {
                order.advancePaid = payment.amount;
                if (order.status === 'quoted') {
                    order.status = 'in_progress';
                    order.statusHistory.push({ status: 'in_progress', note: `Advance payment received via ${paymentMethod}` });
                }
            } else {
                order.balancePaid = payment.amount;
            }

            // Calculate platform commission
            let settings = await PlatformSettings.findOne();
            if (!settings) settings = { commissionPercentage: 10 };
            order.platformCommission = Math.round((order.totalAmount * settings.commissionPercentage) / 100);

            await order.save();

            // Send order confirmation email asynchronously
            if (order.customerId?.email) {
                sendOrderConfirmationEmail({
                    to: order.customerId.email,
                    customerName: order.customerId.name,
                    order,
                    tailorName: order.tailorId?.name || 'Master Tailor'
                }).catch(err => console.error('Failed to send order email:', err.message));
            }

            // Send SMS Confirmation to Customer
            if (order.customerId?.phone) {
                sendSmsOrWhatsApp({
                    phone: order.customerId.phone,
                    message: `Namaste ${order.customerId.name}! Payment of ₹${payment.amount} for Vastra Order #${order._id.toString().slice(-6).toUpperCase()} is verified & secured in Escrow. Your tailor has begun stitching!`
                }).catch(err => console.error('[Payment SMS Error]', err.message));
            }

            // Send Alert SMS to Tailor
            if (order.tailorId?.phone) {
                sendSmsOrWhatsApp({
                    phone: order.tailorId.phone,
                    message: `Namaste ${order.tailorId.name}! Payment of ₹${payment.amount} for Order #${order._id.toString().slice(-6).toUpperCase()} is secured in Escrow. Please start stitching.`
                }).catch(err => console.error('[Tailor Payment SMS Error]', err.message));
            }
        }

        res.json({ success: true, message: 'Payment verified successfully', order });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/orders/:id/invoice
exports.getOrderInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email phone location')
            .populate('tailorId', 'name email phone location');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (req.user.role !== 'admin' &&
            order.customerId._id.toString() !== req.user._id.toString() &&
            order.tailorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
        }

        const invoiceNumber = order.invoiceNumber || `INV-${new Date(order.createdAt).getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`;
        const subtotal = order.quotedPrice || order.totalAmount || 0;
        const shipping = order.shippingCost || 0;
        const gstRate = 0.05; // 5% GST for tailored garments & job work
        const gstAmount = Math.round(subtotal * gstRate);

        const invoice = {
            invoiceNumber,
            invoiceDate: order.createdAt,
            dueDate: order.estimatedDelivery || order.createdAt,
            hsnSacCode: '998822',
            serviceDescription: 'Bespoke Custom Tailoring & Stitching Services',
            customer: {
                name: order.customerId?.name,
                email: order.customerId?.email,
                phone: order.customerId?.phone,
                address: order.deliveryAddress,
            },
            tailor: {
                name: order.tailorId?.name,
                phone: order.tailorId?.phone,
            },
            platform: {
                name: 'Vastra Marketplace Private Limited',
                gstin: '27AABCV1234F1Z5',
                supportEmail: 'orders@vastra.in',
                website: 'https://vastra-marketplace.vercel.app',
            },
            item: {
                name: order.product?.name || 'Custom Garment',
                type: order.product?.type || 'Apparel',
                designChoices: order.product?.designChoices,
                amount: subtotal,
            },
            shippingCost: shipping,
            gstRate: '5% (CGST 2.5% + SGST 2.5%)',
            gstAmount,
            totalAmount: order.totalAmount || (subtotal + shipping + gstAmount),
            paymentStatus: order.isEscrowFunded ? 'Paid (Escrow Secured)' : (order.advancePaid > 0 ? 'Advance Paid' : 'Pending'),
            paymentMethod: order.paymentMethod || 'UPI (Google Pay / BHIM)',
            transactionId: order.upiTransactionId || order.payments?.[0]?.razorpayPaymentId || 'N/A',
        };

        res.json({ success: true, invoice });
    } catch (error) {
        next(error);
    }
};
