export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'status' | 'actions';
}
