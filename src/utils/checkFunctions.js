class CheckFunctions {
    // 匹配是否为中国大陆地区的手机号格式
    isValidChinaMobile(phone) {
        const regex = /^1[3-9]\d{9}$/; // 正则表达式匹配手机号格式
        return regex.test(phone);
    }

    //匹配是否为六位数字验证码
    isValidCaptcha(captcha) {
        const regex = /^\d{6}$/; // 正则表达式匹配六位数字
        return regex.test(captcha);
    }

    /**
     * 密码复杂度检查规则
     * @param password
     * @returns {boolean} 至少8字符且四个要求满足其中三个返回true
     */
    validatePassword = (password) => {
        const lengthRegex = /.{8,}/; // 至少 8 个字符
        const lowerCaseRegex = /[a-z]/; // 至少一个小写字母
        const upperCaseRegex = /[A-Z]/; // 至少一个大写字母
        const digitRegex = /\d/; // 至少一个数字
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // 至少一个特殊字符

        return (
            lengthRegex.test(password) &&
            lowerCaseRegex.test(password) +
                upperCaseRegex.test(password) +
                digitRegex.test(password) +
                specialCharRegex.test(password) >=
                3
        );
    };
}

export default new CheckFunctions();
