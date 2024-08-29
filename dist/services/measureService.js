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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const measureModel_1 = __importDefault(require("../models/measureModel"));
class MeasureService {
    createMeasure(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield measureModel_1.default.create(data);
        });
    }
    confirmMeasure(measure_uuid, confirmed_value) {
        return __awaiter(this, void 0, void 0, function* () {
            const measure = yield measureModel_1.default.findByPk(measure_uuid);
            if (!measure)
                throw new Error('Measure not found');
            if (measure.has_confirmed)
                throw new Error('Confirmation duplicate');
            measure.measure_value = confirmed_value;
            measure.has_confirmed = true;
            yield measure.save();
            return measure;
        });
    }
    listMeasures(customer_code, measure_type) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereCondition = { customer_code };
            if (measure_type)
                whereCondition.measure_type = measure_type;
            return yield measureModel_1.default.findAll({ where: whereCondition });
        });
    }
}
exports.default = MeasureService;
