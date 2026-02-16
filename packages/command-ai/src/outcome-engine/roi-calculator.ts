export interface ROIResult {
  totalInvestment: number;
  totalReturn: number;
  netReturn: number;
  roiPercent: number;
  paybackPeriodDays: number | null;
}

export class ROICalculator {
  calculate(investment: number, returnValue: number, daysRunning = 30): ROIResult {
    const netReturn = returnValue - investment;
    const roiPercent = investment > 0 ? (netReturn / investment) * 100 : 0;

    let paybackPeriodDays: number | null = null;
    if (returnValue > 0 && daysRunning > 0) {
      const dailyReturn = returnValue / daysRunning;
      paybackPeriodDays = dailyReturn > 0 ? Math.ceil(investment / dailyReturn) : null;
    }

    return {
      totalInvestment: investment,
      totalReturn: returnValue,
      netReturn,
      roiPercent,
      paybackPeriodDays,
    };
  }
}
