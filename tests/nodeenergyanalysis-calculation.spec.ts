import { expect, test } from '@playwright/test';
import { NodeEnergyAnalysisHelper } from '../utils/nodeEnergyAnalysisHelper';

test.describe('Node Energy Analysis Delta Calculation Logic', () => {
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

  test('should preserve decimal precision', async () => {
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
});
