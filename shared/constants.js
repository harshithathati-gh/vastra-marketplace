// Shared constants used across backend, web, and mobile

const ORDER_STATUSES = {
    PLACED: 'placed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    QUOTED: 'quoted',
    IN_PROGRESS: 'in_progress',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    DISPUTED: 'disputed',
    CANCELLED: 'cancelled',
};

const ORDER_STATUS_LABELS = {
    placed: 'Order Placed',
    accepted: 'Accepted by Tailor',
    rejected: 'Rejected',
    quoted: 'Price Quoted',
    in_progress: 'In Progress',
    shipped: 'Shipped',
    delivered: 'Delivered',
    disputed: 'Disputed',
    cancelled: 'Cancelled',
};

const ORDER_STATUS_COLORS = {
    placed: '#3B82F6',     // blue
    accepted: '#8B5CF6',   // purple
    rejected: '#EF4444',   // red
    quoted: '#F59E0B',     // amber
    in_progress: '#6366F1', // indigo
    shipped: '#06B6D4',    // cyan
    delivered: '#10B981',  // green
    disputed: '#F97316',   // orange
    cancelled: '#6B7280',  // gray
};

const USER_ROLES = {
    CUSTOMER: 'customer',
    TAILOR: 'tailor',
    ADMIN: 'admin',
};

const CATEGORIES = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'kids', label: 'Kids' },
];

const SUB_CATEGORIES = [
    { value: 'ethnic', label: 'Ethnic' },
    { value: 'western', label: 'Western' },
    { value: 'fusion', label: 'Fusion' },
];

const SPECIALIZATIONS = [
    { value: 'men_ethnic', label: "Men's Ethnic Wear" },
    { value: 'men_western', label: "Men's Western Wear" },
    { value: 'women_ethnic', label: "Women's Ethnic Wear" },
    { value: 'women_western', label: "Women's Western Wear" },
    { value: 'kids', label: 'Kids Wear' },
    { value: 'bridal', label: 'Bridal Wear' },
    { value: 'uniforms', label: 'Uniforms' },
    { value: 'alterations', label: 'Alterations' },
    { value: 'embroidery', label: 'Embroidery' },
    { value: 'designer', label: 'Designer Wear' },
];

const DISPUTE_REASONS = [
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'wrong_product', label: 'Wrong Product Received' },
    { value: 'delayed_delivery', label: 'Delayed Delivery' },
    { value: 'measurement_mismatch', label: 'Measurement Mismatch' },
    { value: 'not_received', label: 'Not Received' },
    { value: 'other', label: 'Other' },
];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal',
];

module.exports = {
    ORDER_STATUSES,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS,
    USER_ROLES,
    CATEGORIES,
    SUB_CATEGORIES,
    SPECIALIZATIONS,
    DISPUTE_REASONS,
    INDIAN_STATES,
};
