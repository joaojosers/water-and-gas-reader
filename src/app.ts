import express from 'express';
import measureRoutes from './routes/measureRoutes';
import MeasureService from './services/measureService';
import MeasureController from './controllers/measureController';

const app = express();
const measureService = new MeasureService();
const measureController = new MeasureController(measureService);

app.use(express.json());
app.use('/measures', measureRoutes(measureController));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
