import ctripApiService from "../utils/ctripRequest.js";
class HomeService {
    /**
     * 调用携程api接口获取低价速报数据并处理
     * @param departureCityCode 出发城市代码
     * @returns {Promise<unknown>}
     */

    fetchCtripApiAndProcess(departureCityCode) {
        const boardListShowSearchApiConfig = {
            url: "/restapi/soa2/15095/boardListShowSearch?_fxpcqlniredt=09031050312106115838&x-traceID=09031050312106115838-1723898045400-4103962",
            method: "post",
            data: {
                dataSearchType: 4,
                requestSource: "online",
                childTravelAffirm: false,
                parentTravelAffirm: false,
                head: {
                    cid: "09031050312106115838",
                    ctok: "",
                    cver: "1.0",
                    lang: "01",
                    sid: "8888",
                    syscode: "999",
                    auth: "",
                    xsid: "",
                    extension: [],
                },
            },
        };
        const fuzzySearchApiConfig = {
            url: "/restapi/soa2/19728/fuzzySearch?_fxpcqlniredt=09031050312106115838&x-traceID=09031050312106115838-1723970650347-7831367",
            method: "post",
            data: {
                tt: 1,
                source: "online_theme",
                st: 6,
                segments: [
                    { dcl: [departureCityCode], acl: ["15"] },
                    { dcl: [departureCityCode], acl: ["13"] },
                    { dcl: [departureCityCode], acl: ["12"] },
                    { dcl: [departureCityCode], acl: ["21"] },
                    { dcl: [departureCityCode], acl: ["19"] },
                    { dcl: [departureCityCode], acl: ["22"] },
                    { dcl: [departureCityCode], acl: ["16"] },
                    { dcl: [departureCityCode], acl: ["17"] },
                ],
                head: {
                    cid: "09031050312106115838",
                    ctok: "",
                    cver: "1.0",
                    lang: "01",
                    sid: "8888",
                    syscode: "999",
                    auth: "",
                    xsid: "",
                    extension: [],
                },
            },
        };
        return new Promise((resolve, reject) => {
            Promise.all([
                ctripApiService(boardListShowSearchApiConfig),
                ctripApiService(fuzzySearchApiConfig),
            ])
                .then((data) => {
                    // fetch成功
                    console.log("=>(homeService.js:64) fetch成功", data);
                    let { boardItemList } = data[0].boardMusterList[0];
                    let { routes } = data[1];
                    for (let i = 0; i < boardItemList.length; i++) {
                        let code = boardItemList[i].code.slice(-2);
                        //为每个卡片添加对应的图标地址
                        boardItemList[i].imageUrl =
                            `https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_${code}.png`;
                        //为每个卡片添加对应的背景色图片地址
                        boardItemList[i].imageBgUrl =
                            `https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_bg${(i % 3) + 1}.jpg`;
                        //为每个卡片添加对应的路线
                        boardItemList[i].routes = routes.slice(
                            i * 5,
                            i * 5 + 5
                        );
                    }
                    resolve({ code: 200, data: boardItemList });
                })
                .catch((err) => {
                    // fetch失败
                    console.log("=>(homeService.js:85) fetch 失败", err);
                    reject({
                        code: err.serviceResult.errcode,
                        error: err,
                        message: err.serviceResult.errmsg,
                    });
                });
        });
    }

    /**
     * 请求携程接口搜索框推荐城市数据
     * @param departureCityCode 城市代码
     * @returns {Promise<unknown>}
     */
    fetchCtripSearchRecommendCityData(departureCityCode) {
        const searchBoxRecommendApiConfig = {
            url: "/restapi/soa2/17909/SearchBoxRecommend?subEnv=fat110",
            method: "post",
            data: {
                head: {
                    cver: "3",
                    cid: "",
                    extension: [
                        { name: "source", value: "ONLINE" },
                        { name: "sotpGroup", value: "CTrip" },
                        { name: "sotpLocale", value: "zh-CN" },
                    ],
                },
                locale: "zh-CN",
                departureCity: departureCityCode,
                dataType: 1,
            },
        };
        return new Promise((resolve, reject) => {
            ctripApiService(searchBoxRecommendApiConfig)
                .then((data) => {
                    console.log("=>(homeService.js:122) data", data);
                    const {
                        hotRecommend: { recommendCity },
                        indexedCity: { cityList, indexList },
                    } = data.recommendGroupList[0];
                    const cityPickerTabBar = ["热门"]; //热门城市
                    cityPickerTabBar.push(...indexList);
                    const cityMap = {}; //按拼音首字母分类后的城市映射表
                    for (let i = 0; i < cityList.length; i++) {
                        let { firstLetterPy } = cityList[i]; //解构城市的首字母
                        if (["I", "U", "V"].includes(firstLetterPy)) {
                            continue;
                        }
                        // 如果映射表中该首字母不存在，就创建一个空数组
                        if (!cityMap[firstLetterPy]) {
                            cityMap[firstLetterPy] = [];
                        }
                        // 往映射表中该首字母的数组插入数据
                        cityMap[firstLetterPy].push(cityList[i]);
                    }
                    resolve({
                        code: 200,
                        data: { recommendCity, cityPickerTabBar, cityMap },
                    });
                })
                .catch((err) => {
                    console.log("=>(homeService.js:126) err", err);
                    reject({ code: 400, error: err });
                });
        });
    }
}

export default new HomeService();
