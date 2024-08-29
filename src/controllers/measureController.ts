import { Request, Response } from 'express';
import MeasureService from '../services/measureService';

class MeasureController {
  private measureService: MeasureService;

  constructor(measureService: MeasureService) {
    this.measureService = measureService;
  }

  public createMeasure = async (req: Request, res: Response): Promise<Response> => {
    try {
      const measure = await this.measureService.createMeasure(req.body);
      return res.status(200).json(measure);
    } catch (error: any) {
      return res.status(400).json({ error_code: 'INVALID_DATA', error_description: error.message });
    }
  };

  public confirmMeasure = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { measure_uuid, confirmed_value } = req.body;
      const measure = await this.measureService.confirmMeasure(measure_uuid, confirmed_value);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      let statusCode = 400;
      if (error.message === 'Measure not found') statusCode = 404;
      else if (error.message === 'Confirmation duplicate') statusCode = 409;

      return res.status(statusCode).json({ error_code: error.message.toUpperCase().replace(' ', '_'), error_description: error.message });
    }
  };

  public listMeasures = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { customer_code } = req.params;
      const { measure_type } = req.query;
      const measures = await this.measureService.listMeasures(customer_code, measure_type as 'WATER' | 'GAS');
      return res.status(200).json({ customer_code, measures });
    } catch (error: any) {
      return res.status(400).json({ error_code: 'INVALID_DATA', error_description: error.message });
    }
  };
}

export default MeasureController;
