import Measure from '../models/measureModel';

interface IMeasureService {
  createMeasure(data: any): Promise<Measure>;
  confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure>;
  listMeasures(customer_code: string, measure_type?: 'WATER' | 'GAS'): Promise<Measure[]>;
}

class MeasureService implements IMeasureService {
  public async createMeasure(data: any): Promise<Measure> {
    return await Measure.create(data);
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
