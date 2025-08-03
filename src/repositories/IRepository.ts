// TODO: Implementar esta interfaz como parte del ejercicio
// Esta es la interfaz base que todos los repositorios deben implementar

export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: number, entity: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
} 