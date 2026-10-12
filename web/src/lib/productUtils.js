export function mapProductImage(p) {
    if (!p) return p;
    const item = { ...p };
    
    if (item.type && item.type.toLowerCase().includes('blouse')) {
        item.baseImage = '/images/products/blouse.jpg';
    } else if (item.type && item.type.toLowerCase().includes('dress')) {
        item.baseImage = '/images/products/dress.jpg';
    } else if ((item.type && (item.type.toLowerCase().includes('trouser') || item.type.toLowerCase().includes('pant'))) || (item.name && (item.name.toLowerCase().includes('trouser') || item.name.toLowerCase().includes('pant')))) {
        item.baseImage = '/images/products/trouser_1.jpg';
        item.category = 'Men and Women';
        item.subCategory = 'Western';
    } else if ((item.type && item.type.toLowerCase().includes('long kurti')) || (item.name && item.name.toLowerCase().includes('long kurti'))) {
        item.baseImage = '/images/products/long_kurti.jpg';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Long Kurti';
    } else if ((item.type && item.type.toLowerCase().includes('kurti')) || (item.name && item.name.toLowerCase().includes('kurti'))) {
        item.baseImage = '/images/products/kurti.png';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Short Kurti';
    } else if ((item.type && item.type.toLowerCase().includes('anarkali')) || (item.name && item.name.toLowerCase().includes('anarkali'))) {
        item.baseImage = '/images/products/anarkali_1.jpg';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Anarkali';
    } else if ((item.type && item.type.toLowerCase().includes('salwar suit')) || (item.name && item.name.toLowerCase().includes('salwar suit'))) {
        item.baseImage = '/images/products/salwar_suit_1.jpg';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Salwar Suit';
    } else if ((item.type && item.type.toLowerCase().includes('half saree')) || (item.name && item.name.toLowerCase().includes('half saree'))) {
        item.baseImage = '/images/products/half_saree_1.jpg';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Half Saree';
    } else if ((item.type && item.type.toLowerCase().includes('lehenga')) || (item.name && item.name.toLowerCase().includes('lehenga'))) {
        item.baseImage = '/images/products/lehenga.png';
        item.category = 'Women';
        item.subCategory = 'Ethnic';
        item.name = 'Lehenga';
    } else if ((item.type && (item.type.toLowerCase().includes('kids kurta') || item.type.toLowerCase().includes('kids men kurta'))) || (item.name && (item.name.toLowerCase().includes('kids kurta') || item.name.toLowerCase().includes('kids men kurta')))) {
        item.baseImage = '/images/products/kids_kurta_1.jpg';
        item.category = 'Kids';
        item.subCategory = 'Ethnic';
        item.name = 'Kids Kurta Set';
    } else if (item.type && item.type.toLowerCase().includes('kurta')) {
        item.baseImage = '/images/products/kurta_mens.png';
    } else if (item.type && item.type.toLowerCase().includes('shirt')) {
        item.baseImage = '/images/products/formal_shirt.png';
    } else if (item.type && item.type.toLowerCase().includes('sherwani')) {
        item.baseImage = '/images/products/sherwani.png';
    } else if (item.type && item.type.toLowerCase().includes('suit')) {
        item.baseImage = '/images/products/two_piece_suit.png';
    }

    return item;
}
