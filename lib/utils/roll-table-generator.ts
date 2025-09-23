import { RollTableData, RollTableRow, DieSize, RollTableGenerationOptions } from '@/types/tables';

/**
 * Generate a complete roll table from source items
 */
export function generateRollTable(options: RollTableGenerationOptions): RollTableData {
  const { dieSize, sourceItems, fillStrategy, allowDuplicates = false } = options;

  const rolls: RollTableRow[] = [];
  const metadata = {
    generatedAt: new Date().toISOString(),
    fillStrategy,
  };

  // Generate roll entries based on die size
  for (let roll = 1; roll <= dieSize; roll++) {
    rolls.push(createRollEntry(roll, sourceItems, fillStrategy, allowDuplicates, rolls));
  }

  return {
    rolls,
    metadata,
  };
}

/**
 * Create a single roll table entry
 */
function createRollEntry(
  roll: number,
  sourceItems: string[],
  fillStrategy: RollTableGenerationOptions['fillStrategy'],
  allowDuplicates: boolean,
  existingRolls: RollTableRow[]
): RollTableRow {
  switch (fillStrategy) {
    case 'auto':
      return createAutoFilledEntry(roll, sourceItems, allowDuplicates, existingRolls);
    case 'manual':
      return { roll, magicItemId: null, customText: 'Enter custom text or select an item' };
    case 'blank':
    default:
      return { roll, magicItemId: null };
  }
}

/**
 * Create an auto-filled roll entry
 */
function createAutoFilledEntry(
  roll: number,
  sourceItems: string[],
  allowDuplicates: boolean,
  existingRolls: RollTableRow[]
): RollTableRow {
  if (sourceItems.length === 0) {
    return { roll, magicItemId: null };
  }

  let availableItems = sourceItems;

  // If duplicates are not allowed, filter out already used items
  if (!allowDuplicates) {
    const usedItems = new Set(
      existingRolls
        .map(r => r.magicItemId)
        .filter((id): id is string => id !== null)
    );
    availableItems = sourceItems.filter(item => !usedItems.has(item));
  }

  // If no available items, return empty entry
  if (availableItems.length === 0) {
    return { roll, magicItemId: null };
  }

  // Select item based on distribution strategy
  const selectedItem = selectItemForRoll(roll, availableItems);

  return {
    roll,
    magicItemId: selectedItem,
  };
}

/**
 * Select an item for a specific roll using weighted distribution
 */
function selectItemForRoll(roll: number, availableItems: string[]): string {
  // Use different strategies based on the number of available items
  if (availableItems.length === 1) {
    return availableItems[0];
  }

  // For small numbers of items, use round-robin distribution
  if (availableItems.length <= 6) {
    const index = (roll - 1) % availableItems.length;
    return availableItems[index];
  }

  // For larger sets, use a more randomized but deterministic approach
  // This creates a pseudo-random but consistent distribution
  const seed = roll * 31; // Simple seeding
  const index = seed % availableItems.length;
  return availableItems[index];
}

/**
 * Optimize roll table distribution to ensure good coverage
 */
export function optimizeRollTableDistribution(
  rollTable: RollTableData,
  sourceItems: string[]
): RollTableData {
  const { rolls, metadata } = rollTable;

  // Count current distribution
  const itemCounts = new Map<string, number>();
  const emptyRolls: number[] = [];

  rolls.forEach((roll, index) => {
    if (roll.magicItemId) {
      const count = itemCounts.get(roll.magicItemId) || 0;
      itemCounts.set(roll.magicItemId, count + 1);
    } else {
      emptyRolls.push(index);
    }
  });

  // Find underrepresented items
  const unusedItems = sourceItems.filter(item => !itemCounts.has(item));
  const underrepresentedItems = sourceItems.filter(item => {
    const count = itemCounts.get(item) || 0;
    const expectedCount = Math.floor(rolls.length / sourceItems.length);
    return count < expectedCount;
  });

  // Fill empty rolls with unused or underrepresented items
  const optimizedRolls = [...rolls];
  let fillIndex = 0;

  emptyRolls.forEach(rollIndex => {
    if (fillIndex < unusedItems.length) {
      optimizedRolls[rollIndex] = {
        ...optimizedRolls[rollIndex],
        magicItemId: unusedItems[fillIndex],
      };
      fillIndex++;
    } else if (fillIndex - unusedItems.length < underrepresentedItems.length) {
      const itemIndex = fillIndex - unusedItems.length;
      optimizedRolls[rollIndex] = {
        ...optimizedRolls[rollIndex],
        magicItemId: underrepresentedItems[itemIndex],
      };
      fillIndex++;
    }
  });

  return {
    rolls: optimizedRolls,
    metadata: {
      ...metadata,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Shuffle roll table entries while maintaining roll numbers
 */
export function shuffleRollTable(rollTable: RollTableData): RollTableData {
  const { rolls, metadata } = rollTable;

  // Extract just the magic item assignments
  const assignments = rolls.map(roll => ({
    magicItemId: roll.magicItemId,
    customText: roll.customText,
  }));

  // Shuffle the assignments using Fisher-Yates algorithm
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }

  // Reassign to rolls maintaining the roll numbers
  const shuffledRolls = rolls.map((roll, index) => ({
    ...roll,
    magicItemId: assignments[index].magicItemId,
    customText: assignments[index].customText,
  }));

  return {
    rolls: shuffledRolls,
    metadata: {
      ...metadata,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Validate roll table completeness and consistency
 */
export function validateRollTable(rollTable: RollTableData, dieSize: number): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all roll numbers are present and correct
  const expectedRolls = Array.from({ length: dieSize }, (_, i) => i + 1);
  const actualRolls = rollTable.rolls.map(r => r.roll).sort((a, b) => a - b);

  if (actualRolls.length !== expectedRolls.length) {
    errors.push(`Expected ${expectedRolls.length} rolls, got ${actualRolls.length}`);
  }

  expectedRolls.forEach(expected => {
    if (!actualRolls.includes(expected)) {
      errors.push(`Missing roll: ${expected}`);
    }
  });

  // Check for duplicate roll numbers
  const rollCounts = new Map<number, number>();
  rollTable.rolls.forEach(roll => {
    const count = rollCounts.get(roll.roll) || 0;
    rollCounts.set(roll.roll, count + 1);
  });

  rollCounts.forEach((count, roll) => {
    if (count > 1) {
      errors.push(`Duplicate roll number: ${roll} (appears ${count} times)`);
    }
  });

  // Check for empty entries
  const emptyCount = rollTable.rolls.filter(
    roll => !roll.magicItemId && !roll.customText
  ).length;

  if (emptyCount > 0) {
    warnings.push(`${emptyCount} empty roll entries`);
  }

  // Check for item distribution if there are items
  const itemCounts = new Map<string, number>();
  rollTable.rolls.forEach(roll => {
    if (roll.magicItemId) {
      const count = itemCounts.get(roll.magicItemId) || 0;
      itemCounts.set(roll.magicItemId, count + 1);
    }
  });

  if (itemCounts.size > 0) {
    const maxCount = Math.max(...itemCounts.values());
    const minCount = Math.min(...itemCounts.values());

    if (maxCount - minCount > 2) {
      warnings.push('Uneven item distribution detected');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get statistics about a roll table
 */
export function getRollTableStats(rollTable: RollTableData): {
  totalRolls: number;
  filledRolls: number;
  emptyRolls: number;
  uniqueItems: number;
  itemDistribution: Map<string, number>;
  completionPercentage: number;
} {
  const totalRolls = rollTable.rolls.length;
  const filledRolls = rollTable.rolls.filter(
    roll => roll.magicItemId || roll.customText
  ).length;
  const emptyRolls = totalRolls - filledRolls;

  const itemDistribution = new Map<string, number>();
  rollTable.rolls.forEach(roll => {
    if (roll.magicItemId) {
      const count = itemDistribution.get(roll.magicItemId) || 0;
      itemDistribution.set(roll.magicItemId, count + 1);
    }
  });

  const uniqueItems = itemDistribution.size;
  const completionPercentage = (filledRolls / totalRolls) * 100;

  return {
    totalRolls,
    filledRolls,
    emptyRolls,
    uniqueItems,
    itemDistribution,
    completionPercentage,
  };
}

/**
 * Export roll table to different formats
 */
export function exportRollTable(
  rollTable: RollTableData,
  format: 'csv' | 'json' | 'markdown',
  tableName?: string
): string {
  switch (format) {
    case 'csv':
      return exportToCSV(rollTable);
    case 'json':
      return exportToJSON(rollTable);
    case 'markdown':
      return exportToMarkdown(rollTable, tableName);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportToCSV(rollTable: RollTableData): string {
  const headers = ['Roll', 'Item ID', 'Custom Text'];
  const rows = rollTable.rolls.map(roll => [
    roll.roll.toString(),
    roll.magicItemId || '',
    roll.customText || '',
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

function exportToJSON(rollTable: RollTableData): string {
  return JSON.stringify(rollTable, null, 2);
}

function exportToMarkdown(rollTable: RollTableData, tableName?: string): string {
  const title = tableName ? `# ${tableName}\n\n` : '';
  const headers = '| Roll | Item | Notes |';
  const separator = '|------|------|-------|';

  const rows = rollTable.rolls.map(roll => {
    const item = roll.magicItemId || '';
    const notes = roll.customText || '';
    return `| ${roll.roll} | ${item} | ${notes} |`;
  });

  return title + [headers, separator, ...rows].join('\n');
}

/**
 * Common die sizes for roll tables
 */
export const COMMON_DIE_SIZES: DieSize[] = [4, 6, 8, 10, 12, 20, 100];

/**
 * Recommended table sizes based on number of source items
 */
export function getRecommendedDieSize(itemCount: number): DieSize {
  if (itemCount <= 4) return 4;
  if (itemCount <= 6) return 6;
  if (itemCount <= 8) return 8;
  if (itemCount <= 10) return 10;
  if (itemCount <= 12) return 12;
  if (itemCount <= 20) return 20;
  return 100;
}

/**
 * Create a balanced roll table that evenly distributes items
 */
export function createBalancedRollTable(
  sourceItems: string[],
  dieSize: DieSize
): RollTableData {
  const options: RollTableGenerationOptions = {
    dieSize,
    sourceItems,
    fillStrategy: 'auto',
    allowDuplicates: sourceItems.length < dieSize,
  };

  const rollTable = generateRollTable(options);
  return optimizeRollTableDistribution(rollTable, sourceItems);
}