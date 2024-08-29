"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const measureRoutes_1 = __importDefault(require("./routes/measureRoutes"));
const measureService_1 = __importDefault(require("./services/measureService"));
const measureController_1 = __importDefault(require("./controllers/measureController"));
const app = (0, express_1.default)();
const measureService = new measureService_1.default();
const measureController = new measureController_1.default(measureService);
app.use(express_1.default.json());
app.use('/measures', (0, measureRoutes_1.default)(measureController));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
