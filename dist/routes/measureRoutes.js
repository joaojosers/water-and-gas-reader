"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const measureRoutes = (measureController) => {
    const router = (0, express_1.Router)();
    router.post('/upload', measureController.createMeasure);
    router.patch('/confirm', measureController.confirmMeasure);
    router.get('/:customer_code/list', measureController.listMeasures);
    return router;
};
exports.default = measureRoutes;
