import { Router } from "express";
const router = Router();

import TicketController from "../controllers/ticketController.js";
router.post("/getFlightSchedule", TicketController.getFlightSchedule);

export default router;
