export const removePriceDecimals = (price: number): string => {
    let finalPrice: string;
    const priceNumber = Number(price); // Cast to Number

    if (priceNumber < 1) {
        finalPrice = priceNumber.toFixed(5);
    } else if (priceNumber < 10) {
        finalPrice = priceNumber.toFixed(5);
    } else if (priceNumber < 100) {
        finalPrice = priceNumber.toFixed(4);
    } else if (priceNumber < 1000) {
        finalPrice = priceNumber.toFixed(3);
    } else if (priceNumber < 10000) {
        finalPrice = priceNumber.toFixed(2);
    } else {
        finalPrice = priceNumber.toFixed(1);
    }
    return finalPrice;
};


export const removePercentDecimals = (percentage: number): string => {
    let percentChange: string;
    const percent24 = Number(percentage);

    if (percent24 > 10000) {
        percentChange = percent24.toFixed(0);
    } else {
        percentChange = percent24.toFixed(2);
    }
    return percentChange;
};

// export const getColorClass = (percentage: number): string => {
//     return percentage >= 0 ? 'text-green-500' : 'text-red-500';
// };

export const setPercentChangesColor = (percentage: number): string => {
    let percentChange: string;
    const percent24 = Number(percentage);

    if (percent24 < 0) {
        percentChange = 'text-red-500'; // Replace with your Tailwind CSS class for negative values
    } else if (percent24 > 0) {
        percentChange = 'text-green-500'; // Replace with your Tailwind CSS class for positive values
    } else {
        percentChange = 'text-gray-500'; // Replace with your Tailwind CSS class for zero values
    }

    return percentChange;
};