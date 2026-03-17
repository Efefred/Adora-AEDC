
export interface ParsedReadingResult {
  raw: string;
  value: number | null;
  isAvailable: boolean;
}

export interface DeltaComputationResult {
  lar: number | null;
  par: number | null;
  delta: number | null;
  isComputable: boolean;
  isNegative: boolean;
  reason?: string;
}

export class NodeEnergyAnalysisHelper {
  static parseReading(value: string): ParsedReadingResult {
    const cleaned = value.replace(/,/g, '').trim();

    if (!cleaned || /^N\/A$/i.test(cleaned)) {
      return {
        raw: value,
        value: null,
        isAvailable: false
      };
    }

    const numericValue = Number(cleaned);

    if (Number.isNaN(numericValue)) {
      throw new Error(`Invalid numeric reading: "${value}"`);
    }

    return {
      raw: value,
      value: numericValue,
      isAvailable: true
    };
  }

  static computeDelta(par: number | null, lar: number | null): DeltaComputationResult {
    if (par === null || lar === null) {
      return {
        lar,
        par,
        delta: null,
        isComputable: false,
        isNegative: false,
        reason: 'LAR or PAR is N/A'
      };
    }

    const delta = par - lar;

    return {
      lar,
      par,
      delta,
      isComputable: true,
      isNegative: delta < 0
    };
  }
}
