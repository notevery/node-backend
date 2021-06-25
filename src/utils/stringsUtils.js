function stringToBase64(str){
    var base64Str = Buffer.from(str).toString('base64');
    return base64Str;
}

function base64ToString(base64Str){
    var str = Buffer.from(base64Str,'base64').toString();
    return str;
}

exports.stringToBase64 = stringToBase64;
exports.base64ToString = base64ToString;