function isValidAmount(message) {
    return !!message.match(/^[0-9\.\,]+$/gi);
}

module.exports = {
    isValidAmount
}