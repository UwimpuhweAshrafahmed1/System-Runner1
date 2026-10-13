import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medimatchRouter from "./medimatch";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medimatchRouter);

export default router;
