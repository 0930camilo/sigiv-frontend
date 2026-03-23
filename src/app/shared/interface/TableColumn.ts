export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'status' | 'actions' | 'button' | 'number' | 'currency' | 'date'; // 👈 AGREGA 'date' AQUÍ
  label?: string;
  action?: (row: any) => void;
  icon?: string; // 👈 AGREGA ESTO
}
