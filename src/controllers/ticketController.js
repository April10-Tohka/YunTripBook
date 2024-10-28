import TicketService from "../services/ticketService.js";
import { sendResponse } from "../utils/sendResponse.js";
class TicketController {
    /**
     * 获取航班时刻表
     * @param req
     * @param res
     */
    getFlightSchedule(req, res) {
        const { departCityCode, arriveCityCode, departDate } = req.body;
        console.log(departCityCode, arriveCityCode, departDate);
        TicketService.queryFlightScheduleAndProcessData(
            departCityCode,
            arriveCityCode,
            departDate
        ).then((data) => {
            sendResponse(res, data);
        });
    }
}

export default new TicketController();
