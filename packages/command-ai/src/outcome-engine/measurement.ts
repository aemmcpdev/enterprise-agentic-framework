export interface Measurement {
  id: string;
  agentId: string;
  metricName: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export class MeasurementCollector {
  private measurements: Measurement[] = [];

  record(agentId: string, metricName: string, value: number, unit: string): Measurement {
    const measurement: Measurement = {
      id: `meas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      metricName,
      value,
      unit,
      timestamp: new Date(),
    };
    this.measurements.push(measurement);
    return measurement;
  }

  getByAgent(agentId: string): Measurement[] {
    return this.measurements.filter((m) => m.agentId === agentId);
  }

  getByMetric(metricName: string): Measurement[] {
    return this.measurements.filter((m) => m.metricName === metricName);
  }

  getRecent(limit = 100): Measurement[] {
    return this.measurements.slice(-limit);
  }

  getAll(): Measurement[] {
    return [...this.measurements];
  }
}
