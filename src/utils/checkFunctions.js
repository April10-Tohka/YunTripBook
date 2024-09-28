class CheckFunctions {
    // 匹配中国大陆地区的手机号格式
    isValidChinaMobile(phone) {
        const regex = /^1[3-9]\d{9}$/; // 正则表达式匹配手机号格式
        return regex.test(phone);
    }

    //匹配六位数字验证码
    isValidCaptcha(captcha) {
        const regex = /^\d{6}$/; // 正则表达式匹配六位数字
        return regex.test(captcha);
    }
}

export default new CheckFunctions();
