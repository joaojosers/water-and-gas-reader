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
const axios_1 = __importDefault(require("axios"));
const server_1 = require("@google/generative-ai/server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MeasureService {
    constructor() {
        this.fileManager = new server_1.GoogleAIFileManager(process.env.API_KEY);
    }
    createMeasure(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Decode the Base64 image and save it as a temporary file
                const base64Image = data.image.replace(/^data:image\/jpeg;base64,/, "");
                const tempImagePath = path_1.default.join(__dirname, 'tempImage.jpg');
                fs_1.default.writeFileSync(tempImagePath, base64Image, 'base64');
                // Upload the temporary image file using GoogleAIFileManager
                const uploadResponse = yield this.fileManager.uploadFile(tempImagePath, {
                    mimeType: "image/jpeg",
                    displayName: `Measure for ${data.customer_code}`
                });
                // Remove the temporary file after upload
                fs_1.default.unlinkSync(tempImagePath);
                console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
                // Use the uploaded file URI in your business logic
                const response = yield axios_1.default.post(process.env.LLM_SERVICE_URL, Object.assign(Object.assign({}, data), { image_url: uploadResponse.file.uri }));
                const { measure_value, image_url, measure_uuid } = response.data;
                // Create a new measure record in the database
                return yield measureModel_1.default.create({
                    measure_uuid,
                    customer_code: data.customer_code,
                    measure_datetime: data.measure_datetime,
                    measure_type: data.measure_type,
                    measure_value,
                    image_url,
                });
            }
            catch (error) {
                console.error("Error creating measure:", error);
                throw new Error(`Failed to create measure: ${error.message}`);
            }
        });
    }
    // Other methods...
    confirmMeasure(measure_uuid, confirmed_value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the measure by its primary key
                const measure = yield measureModel_1.default.findByPk(measure_uuid);
                if (!measure)
                    throw new Error('Measure not found');
                if (measure.has_confirmed)
                    throw new Error('Confirmation duplicate');
                // Update measure value and confirmation status
                measure.measure_value = confirmed_value;
                measure.has_confirmed = true;
                yield measure.save();
                return measure;
            }
            catch (error) {
                // Handle and rethrow errors appropriately
                throw new Error(`Failed to confirm measure: ${error.message}`);
            }
        });
    }
    listMeasures(customer_code, measure_type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereCondition = { customer_code };
                if (measure_type)
                    whereCondition.measure_type = measure_type;
                // Find all measures matching the conditions
                return yield measureModel_1.default.findAll({ where: whereCondition });
            }
            catch (error) {
                // Handle and rethrow errors appropriately
                throw new Error(`Failed to list measures: ${error.message}`);
            }
        });
    }
}
exports.default = MeasureService;
