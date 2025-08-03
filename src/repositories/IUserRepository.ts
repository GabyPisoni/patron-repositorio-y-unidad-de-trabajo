import { IRepository } from './IRepository';
import { User } from '../models/User';

// TODO: Implementar esta interfaz como parte del ejercicio
// Esta interfaz extiende IRepository y agrega métodos específicos para usuarios

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByAgeRange(minAge: number, maxAge: number): Promise<User[]>;
  findUsersCreatedAfter(date: Date): Promise<User[]>;
} 