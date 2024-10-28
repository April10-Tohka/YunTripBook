import flight from "../models/flight.js";
class TicketService {
    //
    queryFlightScheduleAndProcessData(
        departCityCode,
        arriveCityCode,
        departDate
    ) {
        return new Promise((resolve, reject) => {
            flight
                .queryFlightSchedule(departCityCode, arriveCityCode)
                .then((flights) => {
                    const total = flights.length;
                    for (let i = 0; i < flights.length; i++) {
                        // 格式化 depart_time arrive_time 为 "HH:mm" 格式
                        flights[i].depart_time = new Date(
                            flights[i].depart_time
                        )
                            .toISOString()
                            .slice(11, 16); // 仅保留 "HH:mm" 部分
                        flights[i].arrive_time = new Date(
                            flights[i].arrive_time
                        )
                            .toISOString()
                            .slice(11, 16); // 仅保留 "HH:mm" 部分
                        // 格式化 depart_date 为 "YYYY-MM-DD" 格式
                        flights[i].depart_date = departDate;
                        //给每个航班添加对应航空公司的logo
                        flights[i].airline_logo =
                            `https://pic.c-ctrip.com/AssetCatalog/airline/32/${flights[i].airline_code}.png`;
                        //给每个航班添加500-2000随机的票价
                        flights[i].price =
                            Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
                    }
                    const data = {
                        total,
                        flights,
                    };
                    resolve({ code: 200, data });
                });
        });
    }
}

export default new TicketService();
