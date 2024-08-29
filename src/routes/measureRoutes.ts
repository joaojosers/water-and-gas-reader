import { Router } from 'express';
import MeasureController from '../controllers/measureController';

const measureRoutes = (measureController: MeasureController): Router => {
  const router = Router();

  router.post('/upload', measureController.createMeasure);
  router.patch('/confirm', measureController.confirmMeasure);
  router.get('/:customer_code/list', measureController.listMeasures);

  return router;
};

export default measureRoutes;
