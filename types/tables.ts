export interface RollTableRow {
  roll: number;
  magicItemId: string | null;
  customText?: string;
}

export interface RollTableMetadata {
  generatedAt: string;
  sourceListName?: string;
  fillStrategy: 'auto' | 'manual' | 'blank';
}

export interface RollTableData {
  rolls: RollTableRow[];
  metadata: RollTableMetadata;
}

export interface RollTable {
  id: string;
  userId?: string | null;
  sourceListId?: string | null;
  name: string;
  dieSize: number;
  shareToken: string;
  isPublic: boolean;
  tableData: RollTableData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRollTableRequest {
  name: string;
  dieSize: number;
  sourceListId?: string | null;
  tableData: RollTableData;
}

export interface UpdateRollTableRequest {
  name?: string;
  dieSize?: number;
  tableData?: RollTableData;
}

export type DieSize = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface RollTableGenerationOptions {
  dieSize: number;
  sourceItems: string[];
  fillStrategy: 'auto' | 'manual' | 'blank';
  allowDuplicates?: boolean;
}