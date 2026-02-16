import type { Delta } from './delta.js';
import type { ROIResult } from './roi-calculator.js';

export class NarrativeGenerator {
  generateSummary(deltas: Delta[], roi: ROIResult): string {
    const improved = deltas.filter((d) => d.improved);
    const declined = deltas.filter((d) => !d.improved && d.change !== 0);

    const parts: string[] = [];

    if (improved.length > 0) {
      const top = improved.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0]!;
      parts.push(`${improved.length} metric(s) improved. Top: ${top.metricName} (+${top.changePercent.toFixed(1)}%).`);
    }

    if (declined.length > 0) {
      parts.push(`${declined.length} metric(s) declined.`);
    }

    if (roi.roiPercent > 0) {
      parts.push(`ROI: ${roi.roiPercent.toFixed(1)}%.`);
    }

    if (roi.paybackPeriodDays !== null) {
      parts.push(`Payback: ${roi.paybackPeriodDays} days.`);
    }

    return parts.join(' ') || 'No significant changes detected.';
  }
}
