import express from 'express';
import measureRoutes from './routes/measureRoutes';
import MeasureController from './controllers/measureController';
import MeasureService from './services/measureService';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize the MeasureService and MeasureController
const measureService = new MeasureService(); // Assuming you have a MeasureService class
const measureController = new MeasureController(measureService);

// Add measure routes to the app
app.use('/', measureRoutes(measureController)); // Pass the initialized controller

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
