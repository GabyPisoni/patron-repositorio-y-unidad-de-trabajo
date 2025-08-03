import { IUserRepository } from '../repositories/IUserRepository';

// TODO: Implementar esta interfaz como parte del ejercicio
// Esta interfaz maneja transacciones y coordina múltiples repositorios

export interface IUnitOfWork {
  // Repositorios
  users: IUserRepository;
  
  // Métodos de transacción
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  
  // Método para ejecutar operaciones en una transacción
  executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;
} 