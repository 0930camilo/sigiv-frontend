export interface TableButton {
  label?: string;
  icon?: string;
  title?: string;
  action: (row: any) => void;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'status' | 'actions' | 'button' | 'buttons' | 'number' | 'currency' | 'date';
  label?: string;
  action?: (row: any) => void;
  icon?: string;
  buttons?: TableButton[];
}
