const { expect, test } = require('@playwright/test');
const { NodeEnergyAnalysisHelper } = require('../utils/nodeEnergyAnalysisHelper');

test.describe('Node Energy Analysis Calculation Helper Logic', () => {
  test('should compute positive delta when PAR > LAR', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(4458.765, 4387.152);

    expect(result.isComputable).toBeTruthy();
    expect(result.delta).toBeCloseTo(71.613, 6);
    expect(result.isNegative).toBeFalsy();
  });

  test('should return zero when PAR equals LAR', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(4387.152, 4387.152);

    expect(result.isComputable).toBeTruthy();
    expect(result.delta).toBe(0);
    expect(result.isNegative).toBeFalsy();
  });

  test('should allow negative delta when PAR < LAR', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(4300.25, 4387.152);

    expect(result.isComputable).toBeTruthy();
    expect(result.delta).toBeCloseTo(-86.902, 6);
    expect(result.isNegative).toBeTruthy();
  });

  test('should support very large numeric values without overflow', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(999999999999.999, 888888888888.888);

    expect(result.isComputable).toBeTruthy();
    expect(result.delta).toBeCloseTo(111111111111.111, 3);
    expect(result.isNegative).toBeFalsy();
  });

  test('should preserve decimal precision for delta', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(100.555, 99.444);

    expect(result.isComputable).toBeTruthy();
    expect(result.delta).toBeCloseTo(1.111, 6);
  });

  test('should return null delta when LAR is N/A', async () => {
    const result = NodeEnergyAnalysisHelper.computeDelta(4458.765, null);

    expect(result.isComputable).toBeFalsy();
    expect(result.delta).toBeNull();
  });

  test('should parse formatted numeric string correctly', async () => {
    const parsedValue = NodeEnergyAnalysisHelper.parseReading('4,387.152');

    expect(parsedValue.isAvailable).toBeTruthy();
    expect(parsedValue.value).toBeCloseTo(4387.152, 6);
  });

  test('should parse "N/A" as unavailable', async () => {
    const parsedValue = NodeEnergyAnalysisHelper.parseReading('N/A');

    expect(parsedValue.isAvailable).toBeFalsy();
    expect(parsedValue.value).toBeNull();
  });

  test('should compute energy received correctly when delta and MF are valid', async () => {
    const result = NodeEnergyAnalysisHelper.computeEnergyReceived(79.659, 1);

    expect(result.isComputable).toBeTruthy();
    expect(result.energyReceived).toBeCloseTo(79.659, 6);
  });

  test('should apply decimal MF correctly for energy received', async () => {
    const result = NodeEnergyAnalysisHelper.computeEnergyReceived(79.659, 1.5);

    expect(result.isComputable).toBeTruthy();
    expect(result.energyReceived).toBeCloseTo(119.4885, 6);
  });

  test('should return zero energy received when delta is zero', async () => {
    const result = NodeEnergyAnalysisHelper.computeEnergyReceived(0, 1.25);

    expect(result.isComputable).toBeTruthy();
    expect(result.energyReceived).toBe(0);
  });

  test('should return non-computable energy received when MF is null', async () => {
    const result = NodeEnergyAnalysisHelper.computeEnergyReceived(79.659, null);

    expect(result.isComputable).toBeFalsy();
    expect(result.energyReceived).toBeNull();
  });

  test('should compute positive losses when energy received is greater than retailed energy', async () => {
    const result = NodeEnergyAnalysisHelper.computeLosses(71.613, 13.916);

    expect(result.isComputable).toBeTruthy();
    expect(result.losses).toBeCloseTo(57.697, 6);
    expect(result.isNegative).toBeFalsy();
  });

  test('should compute zero losses when energy received equals retailed energy', async () => {
    const result = NodeEnergyAnalysisHelper.computeLosses(13.916, 13.916);

    expect(result.isComputable).toBeTruthy();
    expect(result.losses).toBe(0);
    expect(result.isNegative).toBeFalsy();
  });

  test('should allow negative losses when retailed energy exceeds energy received', async () => {
    const result = NodeEnergyAnalysisHelper.computeLosses(10.5, 13.916);

    expect(result.isComputable).toBeTruthy();
    expect(result.losses).toBeCloseTo(-3.416, 6);
    expect(result.isNegative).toBeTruthy();
  });

  test('should compute losses percentage correctly for valid inputs', async () => {
    const result = NodeEnergyAnalysisHelper.computeLossPercentage(40.36, 79.659);

    expect(result.isComputable).toBeTruthy();
    expect(result.percentage).toBeCloseTo(50.666, 3);
  });

  test('should compute zero losses percentage when losses is zero', async () => {
    const result = NodeEnergyAnalysisHelper.computeLossPercentage(0, 79.659);

    expect(result.isComputable).toBeTruthy();
    expect(result.percentage).toBe(0);
  });

  test('should return non-computable losses percentage when energy received is zero', async () => {
    const result = NodeEnergyAnalysisHelper.computeLossPercentage(10, 0);

    expect(result.isComputable).toBeFalsy();
    expect(result.percentage).toBeNull();
  });

  test('should compute expected revenue correctly', async () => {
    const result = NodeEnergyAnalysisHelper.computeExpectedRevenue(79.659, 209.5);

    expect(result.isComputable).toBeTruthy();
    expect(result.revenue).toBeCloseTo(11257771.625, 3);
  });

  test('should return non-computable expected revenue when tariff rate is missing', async () => {
    const result = NodeEnergyAnalysisHelper.computeExpectedRevenue(79.659, null);

    expect(result.isComputable).toBeFalsy();
    expect(result.revenue).toBeNull();
  });

  test('should compare values correctly with tolerance', async () => {
    const matches = NodeEnergyAnalysisHelper.compareWithTolerance(13.9164, 13.9160, 0.001);

    expect(matches).toBeTruthy();
  });

  test('should fail value comparison outside tolerance', async () => {
    const matches = NodeEnergyAnalysisHelper.compareWithTolerance(13.918, 13.916, 0.001);

    expect(matches).toBeFalsy();
  });

  test('should round values to 3 decimal places', async () => {
    const rounded = NodeEnergyAnalysisHelper.roundTo(57.69749, 3);

    expect(rounded).toBe(57.697);
  });
});
