import prisma from "../utils/prismaClient.js";
class Flight {
    //
    queryFlightSchedule(departCityCode, arriveCityCode) {
        return new Promise((resolve, reject) => {
            prisma.flight
                .findMany({
                    where: {
                        depart_city_code: departCityCode,
                        arrive_city_code: arriveCityCode,
                    },
                })
                .then((flights) => {
                    resolve(flights);
                })
                .catch((err) => {
                    console.log("=>(flight.js:23) err", err);
                    reject(err);
                });
        });
    }
}
export default new Flight();
