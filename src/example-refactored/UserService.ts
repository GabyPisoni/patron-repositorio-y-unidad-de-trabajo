// EJEMPLO: Así debería verse el servicio después del refactoring
// Este archivo es solo para referencia, no es parte del ejercicio

import { IUserService } from '../services/IUserService';
import { IUnitOfWork } from '../unit-of-work/IUnitOfWork';
import { User, CreateUserDto, UpdateUserDto } from '../models/User';

export class UserService implements IUserService {
  constructor(private unitOfWork: IUnitOfWork) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    await this.validateUserData(userData);
    
    const user: Omit<User, 'id'> = {
      name: userData.name,
      email: userData.email,
      age: userData.age,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.unitOfWork.users.create(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.unitOfWork.users.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.unitOfWork.users.findAll();
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User | null> {
    const user = await this.unitOfWork.users.findById(id);
    if (!user) {
      return null;
    }

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    return this.unitOfWork.users.update(id, updatedUser);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.unitOfWork.users.delete(id);
  }

  // EJEMPLO: Operación compleja usando Unit of Work con transacciones
  async transferUserData(fromUserId: number, toUserId: number): Promise<boolean> {
    return this.unitOfWork.executeInTransaction(async () => {
      const fromUser = await this.unitOfWork.users.findById(fromUserId);
      const toUser = await this.unitOfWork.users.findById(toUserId);

      if (!fromUser || !toUser) {
        throw new Error('Uno o ambos usuarios no existen');
      }

      // Actualizar el usuario destino con los datos del origen
      await this.unitOfWork.users.update(toUserId, {
        name: fromUser.name,
        email: fromUser.email,
        age: fromUser.age,
        updatedAt: new Date()
      });

      // Eliminar el usuario origen
      await this.unitOfWork.users.delete(fromUserId);

      return true;
    });
  }

  async createUserWithValidation(userData: CreateUserDto): Promise<User> {
    await this.validateUserData(userData);
    return this.createUser(userData);
  }

  async validateUserData(userData: CreateUserDto): Promise<void> {
    if (userData.age < 0 || userData.age > 150) {
      throw new Error('Edad inválida');
    }

    if (!userData.email.includes('@')) {
      throw new Error('Email inválido');
    }

    const isUnique = await this.isEmailUnique(userData.email);
    if (!isUnique) {
      throw new Error('Email ya existe');
    }
  }

  async isEmailUnique(email: string): Promise<boolean> {
    const existingUser = await this.unitOfWork.users.findByEmail(email);
    return existingUser === null;
  }
} 