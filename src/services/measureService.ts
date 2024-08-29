import Measure from '../models/measureModel';
import axios from 'axios';

interface IMeasureService {
  createMeasure(data: any): Promise<Measure>;
  confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure>;
  listMeasures(customer_code: string, measure_type?: 'WATER' | 'GAS'): Promise<Measure[]>;
}

class MeasureService implements IMeasureService {
  public async createMeasure(data: any): Promise<Measure> {
    const response = await axios.post(process.env.LLM_SERVICE_URL!, data);
    const { measure_value, image_url, measure_uuid } = response.data;

    return await Measure.create({
      measure_uuid,
      customer_code: data.customer_code,
      measure_datetime: data.measure_datetime,
      measure_type: data.measure_type,
      measure_value,
      image_url,
    });
  }

  public async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure> {
    const measure = await Measure.findByPk(measure_uuid);
    if (!measure) throw new Error('Measure not found');
    if (measure.has_confirmed) throw new Error('Confirmation duplicate');

    measure.measure_value = confirmed_value;
    measure.has_confirmed = true;
    await measure.save();

    return measure;
  }

  public async listMeasures(customer_code: string, measure_type?: 'WATER' | 'GAS'): Promise<Measure[]> {
    const whereCondition: any = { customer_code };
    if (measure_type) whereCondition.measure_type = measure_type;

    return await Measure.findAll({ where: whereCondition });
  }
}

export default MeasureService;
