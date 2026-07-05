import Dexie, { type EntityTable } from 'dexie';

export interface LocalTask {
  id: string; // We'll generate cuids locally or use uuid
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const db = new Dexie('TaskFlowDB') as Dexie & {
  tasks: EntityTable<
    LocalTask,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  tasks: 'id, title, status, priority, dueDate, createdAt, updatedAt' // primary key and indexed props
});

export type { db };
export default db;
