import Measure from '../models/measureModel';
import axios from 'axios';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';

interface MeasureData {
  image: string; // Base64 encoded image string
  customer_code: string;
  measure_datetime: Date;
  measure_type: 'WATER' | 'GAS';
}

class MeasureService {
  private fileManager: GoogleAIFileManager;

  constructor() {
    this.fileManager = new GoogleAIFileManager(process.env.API_KEY!);
  }

  public async createMeasure(data: MeasureData): Promise<Measure> {
    try {
      // Decode the Base64 image and save it as a temporary file
      const base64Image = data.image.replace(/^data:image\/jpeg;base64,/, "");
      const tempImagePath = path.join(__dirname, 'tempImage.jpg');
      fs.writeFileSync(tempImagePath, base64Image, 'base64');

      // Upload the temporary image file using GoogleAIFileManager
      const uploadResponse = await this.fileManager.uploadFile(tempImagePath, {
        mimeType: "image/jpeg",
        displayName: `Measure for ${data.customer_code}`
      });

      // Remove the temporary file after upload
      fs.unlinkSync(tempImagePath);

      console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

      // Use the uploaded file URI in your business logic
      const response = await axios.post(process.env.LLM_SERVICE_URL!, {
        ...data,
        image_url: uploadResponse.file.uri,
      });

      const { measure_value, image_url, measure_uuid } = response.data;

      // Create a new measure record in the database
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
      throw new Error(`Failed to create measure: ${error.message}`);
    }
  }

  // Other methods...
  public async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure> {
    try {
      // Find the measure by its primary key
      const measure = await Measure.findByPk(measure_uuid);
      if (!measure) throw new Error('Measure not found');
      if (measure.has_confirmed) throw new Error('Confirmation duplicate');

      // Update measure value and confirmation status
      measure.measure_value = confirmed_value;
      measure.has_confirmed = true;
      await measure.save();

      return measure;
    } catch (error: any) {
      // Handle and rethrow errors appropriately
      throw new Error(`Failed to confirm measure: ${error.message}`);
    }
  }

  public async listMeasures(customer_code: string, measure_type?: 'WATER' | 'GAS'): Promise<Measure[]> {
    try {
      const whereCondition: any = { customer_code };
      if (measure_type) whereCondition.measure_type = measure_type;

      // Find all measures matching the conditions
      return await Measure.findAll({ where: whereCondition });
    } catch (error: any) {
      // Handle and rethrow errors appropriately
      throw new Error(`Failed to list measures: ${error.message}`);
    }
  }

}

export default MeasureService;
