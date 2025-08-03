import { User, CreateUserDto, UpdateUserDto } from '../models/User';

// TODO: Implementar esta interfaz como parte del ejercicio
// Esta interfaz contiene la lógica de negocio para usuarios

export interface IUserService {
  // Operaciones básicas
  createUser(userData: CreateUserDto): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: UpdateUserDto): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  
  // Operaciones de negocio complejas
  transferUserData(fromUserId: number, toUserId: number): Promise<boolean>;
  createUserWithValidation(userData: CreateUserDto): Promise<User>;
  
  // Validaciones de negocio
  validateUserData(userData: CreateUserDto): Promise<void>;
  isEmailUnique(email: string): Promise<boolean>;
} 