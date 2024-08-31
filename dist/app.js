"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const measureRoutes_1 = __importDefault(require("./routes/measureRoutes"));
const measureController_1 = __importDefault(require("./controllers/measureController"));
const measureService_1 = __importDefault(require("./services/measureService"));
const app = (0, express_1.default)();
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Initialize the MeasureService and MeasureController
const measureService = new measureService_1.default(); // Assuming you have a MeasureService class
const measureController = new measureController_1.default(measureService);
// Add measure routes to the app
app.use('/', (0, measureRoutes_1.default)(measureController)); // Pass the initialized controller
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
