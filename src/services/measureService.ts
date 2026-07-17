import Measure from '../models/measureModel';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';

interface MeasureData {
  image: string; // Base64 encoded image string
  customer_code: string;
  measure_datetime: Date;
  measure_type: 'WATER' | 'GAS';
}

class MeasureService {
  private fileManager: GoogleAIFileManager;
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    this.fileManager = new GoogleAIFileManager(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async createMeasure(data: MeasureData): Promise<Measure> {
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

      const existingMeasure = await Measure.findOne({
        where: {
          customer_code: data.customer_code,
          measure_type: data.measure_type,
          measure_datetime: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      });

      if (existingMeasure) {
        throw new Error('DOUBLE_REPORT');
      }

      // 3. Decode the Base64 image and save it as a temporary file
      const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
      const tempImagePath = path.join(__dirname, `tempImage_${Date.now()}.jpg`);
      fs.writeFileSync(tempImagePath, base64Data, 'base64');

      // 4. Upload the temporary image file using GoogleAIFileManager
      const uploadResponse = await this.fileManager.uploadFile(tempImagePath, {
        mimeType: "image/jpeg",
        displayName: `Measure for ${data.customer_code}`
      });

      // Remove the temporary file after upload
      fs.unlinkSync(tempImagePath);

      console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

      // 5. Call Gemini Vision API directly to perform OCR and isolate digits
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              measure_value: { type: SchemaType.INTEGER, description: "The numerical value read from the meter" }
            },
            required: ["measure_value"]
          }
        }
      });

      const response = await model.generateContent([
        {
          fileData: {
            fileUri: uploadResponse.file.uri,
            mimeType: uploadResponse.file.mimeType,
          },
        },
        `Analyze this image of a utility meter (${data.measure_type.toLowerCase()}). Extract the numerical reading shown on the meter display. Return only the reading as an integer under the key 'measure_value' in the JSON object.`
      ]);

      const responseText = response.response.text();
      let measure_value: number;
      try {
        const parsed = JSON.parse(responseText);
        measure_value = Number(parsed.measure_value);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", responseText, parseError);
        const match = responseText.match(/\d+/);
        if (match) {
          measure_value = Number(match[0]);
        } else {
          throw new Error("Could not extract a valid numerical value from the image");
        }
      }

      const measure_uuid = randomUUID();
      const image_url = uploadResponse.file.uri;

      // 6. Create a new measure record in the database
      return await Measure.create({
        measure_uuid,
        customer_code: data.customer_code,
        measure_datetime: data.measure_datetime,
        measure_type: data.measure_type,
        measure_value,
        image_url,
      });
    } catch (error: any) {
      console.error("Error creating measure:", error);
      throw error;
    }
  }

  public async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure> {
    try {
      const measure = await Measure.findByPk(measure_uuid);
      if (!measure) throw new Error('Measure not found');
      if (measure.has_confirmed) throw new Error('Confirmation duplicate');

      measure.measure_value = confirmed_value;
      measure.has_confirmed = true;
      await measure.save();

      return measure;
    } catch (error: any) {
      throw new Error(`Failed to confirm measure: ${error.message}`);
    }
  }

  public async listMeasures(customer_code: string, measure_type?: 'WATER' | 'GAS'): Promise<Measure[]> {
    try {
      const whereCondition: any = { customer_code };
      if (measure_type) whereCondition.measure_type = measure_type;

      return await Measure.findAll({ where: whereCondition });
    } catch (error: any) {
      throw new Error(`Failed to list measures: ${error.message}`);
    }
  }
}

export default MeasureService;
