"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class MeasureController {
    constructor(measureService) {
        this.createMeasure = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const measure = yield this.measureService.createMeasure(req.body);
                return res.status(200).json(measure);
            }
            catch (error) {
                return res.status(400).json({ error_code: 'INVALID_DATA', error_description: error.message });
            }
        });
        this.confirmMeasure = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { measure_uuid, confirmed_value } = req.body;
                const measure = yield this.measureService.confirmMeasure(measure_uuid, confirmed_value);
                return res.status(200).json({ success: true });
            }
            catch (error) {
                let statusCode = 400;
                if (error.message === 'Measure not found')
                    statusCode = 404;
                else if (error.message === 'Confirmation duplicate')
                    statusCode = 409;
                return res.status(statusCode).json({ error_code: error.message.toUpperCase().replace(' ', '_'), error_description: error.message });
            }
        });
        this.listMeasures = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { customer_code } = req.params;
                const { measure_type } = req.query;
                const measures = yield this.measureService.listMeasures(customer_code, measure_type);
                return res.status(200).json({ customer_code, measures });
            }
            catch (error) {
                return res.status(400).json({ error_code: 'INVALID_DATA', error_description: error.message });
            }
        });
        this.measureService = measureService;
    }
}
exports.default = MeasureController;
