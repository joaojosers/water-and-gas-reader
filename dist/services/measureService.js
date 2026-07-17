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
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const sequelize_1 = require("sequelize");
class MeasureService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        this.fileManager = new server_1.GoogleAIFileManager(apiKey);
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    createMeasure(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Basic validation
                if (!data.image || typeof data.image !== 'string') {
                    throw new Error('Image is required and must be a base64 string');
                }
                if (!data.customer_code || typeof data.customer_code !== 'string') {
                    throw new Error('Customer code is required');
                }
                if (!data.measure_datetime || isNaN(Date.parse(data.measure_datetime.toString()))) {
                    throw new Error('Measure datetime is required and must be a valid date');
                }
                if (data.measure_type !== 'WATER' && data.measure_type !== 'GAS') {
                    throw new Error('Measure type must be WATER or GAS');
                }
                // 2. Check if a reading of the same type already exists for this customer in the same month
                const measureDate = new Date(data.measure_datetime);
                const startOfMonth = new Date(measureDate.getFullYear(), measureDate.getMonth(), 1);
                const endOfMonth = new Date(measureDate.getFullYear(), measureDate.getMonth() + 1, 0, 23, 59, 59, 999);
                const existingMeasure = yield measureModel_1.default.findOne({
                    where: {
                        customer_code: data.customer_code,
                        measure_type: data.measure_type,
                        measure_datetime: {
                            [sequelize_1.Op.between]: [startOfMonth, endOfMonth],
                        },
                    },
                });
                if (existingMeasure) {
                    throw new Error('DOUBLE_REPORT');
                }
                // 3. Decode the Base64 image and save it as a temporary file
                const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
                const tempImagePath = path_1.default.join(__dirname, `tempImage_${Date.now()}.jpg`);
                fs_1.default.writeFileSync(tempImagePath, base64Data, 'base64');
                // 4. Upload the temporary image file using GoogleAIFileManager
                const uploadResponse = yield this.fileManager.uploadFile(tempImagePath, {
                    mimeType: "image/jpeg",
                    displayName: `Measure for ${data.customer_code}`
                });
                // Remove the temporary file after upload
                fs_1.default.unlinkSync(tempImagePath);
                console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
                // 5. Call Gemini Vision API directly to perform OCR and isolate digits
                const model = this.genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: generative_ai_1.SchemaType.OBJECT,
                            properties: {
                                measure_value: { type: generative_ai_1.SchemaType.INTEGER, description: "The numerical value read from the meter" }
                            },
                            required: ["measure_value"]
                        }
                    }
                });
                const response = yield model.generateContent([
                    {
                        fileData: {
                            fileUri: uploadResponse.file.uri,
                            mimeType: uploadResponse.file.mimeType,
                        },
                    },
                    `Analyze this image of a utility meter (${data.measure_type.toLowerCase()}). Extract the numerical reading shown on the meter display. Return only the reading as an integer under the key 'measure_value' in the JSON object.`
                ]);
                const responseText = response.response.text();
                let measure_value;
                try {
                    const parsed = JSON.parse(responseText);
                    measure_value = Number(parsed.measure_value);
                }
                catch (parseError) {
                    console.error("Failed to parse Gemini response:", responseText, parseError);
                    const match = responseText.match(/\d+/);
                    if (match) {
                        measure_value = Number(match[0]);
                    }
                    else {
                        throw new Error("Could not extract a valid numerical value from the image");
                    }
                }
                const measure_uuid = (0, crypto_1.randomUUID)();
                const image_url = uploadResponse.file.uri;
                // 6. Create a new measure record in the database
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
                throw error;
            }
        });
    }
    confirmMeasure(measure_uuid, confirmed_value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const measure = yield measureModel_1.default.findByPk(measure_uuid);
                if (!measure)
                    throw new Error('Measure not found');
                if (measure.has_confirmed)
                    throw new Error('Confirmation duplicate');
                measure.measure_value = confirmed_value;
                measure.has_confirmed = true;
                yield measure.save();
                return measure;
            }
            catch (error) {
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
                return yield measureModel_1.default.findAll({ where: whereCondition });
            }
            catch (error) {
                throw new Error(`Failed to list measures: ${error.message}`);
            }
        });
    }
}
exports.default = MeasureService;
