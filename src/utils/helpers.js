function isValidAmount(message) {
    return !!message.match(/^[0-9\.\,]+$/gi);
}

function validateAmount(text) {
    return text.replace(/,/g, '.');
}

function validateCase(text, array) {
    text = text.toLowerCase();
    var idx = array.findIndex(s => s.toLowerCase() === text);
    if (idx === -1) return null;
    return array[idx];
}

module.exports = {
    isValidAmount,
    validateAmount,
    validateCase
}