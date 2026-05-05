class NodeEnergyAnalysisHelper {
  /**
   * Parses UI readings like "4,387.152", "N/A", "-", "-∞"
   */
  static parseReading(value) {
    if (value === null || value === undefined) {
      return {
        raw: value,
        value: null,
        isAvailable: false
      };
    }

    const cleaned = String(value).replace(/,/g, '').trim();

    if (
      !cleaned ||
      /^N\/A$/i.test(cleaned) ||
      cleaned === '-' ||
      cleaned === '-∞' ||
      cleaned === '∞'
    ) {
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

  /**
   * Computes Energy Delta (PAR - LAR)
   */
  static computeDelta(par, lar) {
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

  /**
   * Rounds value to specified decimal places (default = 3)
   */
  static roundTo(value, decimals = 3) {
    if (value === null || value === undefined) return null;
    return Number(Number(value).toFixed(decimals));
  }

  /**
   * Safe comparison using tolerance (default = 0.001)
   */
  static compareWithTolerance(actual, expected, tolerance = 0.001) {
    if (
      actual === null ||
      expected === null ||
      actual === undefined ||
      expected === undefined
    ) {
      return false;
    }

    return Math.abs(actual - expected) <= tolerance;
  }

  /**
   * B. Energy Received
   * Formula:
   * energyReceived = delta × MF
   */
  static computeEnergyReceived(deltaMwh, mf) {
    if (
      deltaMwh === null ||
      deltaMwh === undefined ||
      mf === null ||
      mf === undefined
    ) {
      return {
        energyReceived: null,
        isComputable: false,
        reason: 'Delta or MF is null'
      };
    }

    const energyReceived = deltaMwh * mf;

    return {
      energyReceived,
      isComputable: true
    };
  }

  /**
   * C. Retailed Energy
   * NOTE:
   * We now read retailed energy directly from the searched row.
   * This method is kept only to avoid breaking any older code path.
   */
  static computeRetailedEnergy(totalCustomerConsumptionMwh) {
    if (
      totalCustomerConsumptionMwh === null ||
      totalCustomerConsumptionMwh === undefined
    ) {
      return null;
    }

    return totalCustomerConsumptionMwh;
  }

  /**
   * D. Losses (MWh)
   */
  static computeLosses(energyReceivedMwh, retailedEnergyMwh) {
    if (energyReceivedMwh === null || retailedEnergyMwh === null) {
      return {
        losses: null,
        isComputable: false,
        isNegative: false,
        reason: 'Energy Received or Retailed Energy is null'
      };
    }

    const losses = energyReceivedMwh - retailedEnergyMwh;

    return {
      losses,
      isComputable: true,
      isNegative: losses < 0
    };
  }

  /**
   * E. Losses Percentage
   */
  static computeLossPercentage(lossesMwh, energyReceivedMwh) {
    if (
      lossesMwh === null ||
      energyReceivedMwh === null ||
      energyReceivedMwh === 0
    ) {
      return {
        percentage: null,
        isComputable: false,
        reason: 'Division by zero or null input'
      };
    }

    const percentage = (lossesMwh / energyReceivedMwh) * 100;

    return {
      percentage,
      isComputable: true
    };
  }

  /**
   * F. Expected Revenue
   * Formula:
   * energyReceived_mwh × 1000 × tariffRate × 0.9 × 0.75
   */
  static computeExpectedRevenue(energyReceivedMwh, tariffRate) {
    if (
      energyReceivedMwh === null ||
      tariffRate === null ||
      tariffRate === undefined
    ) {
      return {
        revenue: null,
        isComputable: false,
        reason: 'Missing inputs'
      };
    }

    const ALLOWABLE_LOSS = 0.9;
    const VAT = 0.75;

    const revenue =
      energyReceivedMwh * 1000 * tariffRate * ALLOWABLE_LOSS * VAT;

    return {
      revenue,
      isComputable: true
    };
  }
}

module.exports = { NodeEnergyAnalysisHelper };