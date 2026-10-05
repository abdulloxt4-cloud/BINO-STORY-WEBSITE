import { Router, type IRouter } from "express";
import healthRouter from "./health";
import binoRouter from "./bino";

const router: IRouter = Router();

router.use(healthRouter);
router.use(binoRouter);

export default router;
