import { CreateUserDto, UpdateUserDto, User } from "../models/User";
import { IUnitOfWork } from "../unit-of-work/IUnitOfWork";
import { IUserService } from "./IUserService";

export class UserService implements IUserService {
  constructor(private unitOfWork: IUnitOfWork) {}
  async createUser(userData: CreateUserDto): Promise<User> {
    await this.validateUserData(userData);

    return this.unitOfWork.users.create(userData);
  }

  // PROBLEMA: Código duplicado para acceso a datos
  async getUserById(id: number): Promise<User | null> {
    return await this.unitOfWork.users.findById(id);
  }

  // PROBLEMA: Más código duplicado
  async getAllUsers(): Promise<User[]> {
    return await this.unitOfWork.users.findAll();
  }

  // PROBLEMA: Lógica de negocio mezclada con acceso a datos
  async updateUser(id: number, userData: UpdateUserDto): Promise<User | null> {
    const user = this.unitOfWork.users.findById(id);
    if (!user) throw Error("Usuario no existe");

    const updateUser = { ...user, ...userData, updateAt: new Date() };
    return await this.unitOfWork.users.update(id, updateUser);
  }

  // PROBLEMA: No hay transacciones para operaciones complejas
  async deleteUser(id: number): Promise<boolean> {
    return await this.unitOfWork.users.delete(id);
  }

  // PROBLEMA: Operación compleja sin transacciones
  async transferUserData(
    fromUserId: number,
    toUserId: number
  ): Promise<boolean> {
    try {
      const fromUser = await this.unitOfWork.users.findById(fromUserId);
      const toUser = await this.unitOfWork.users.findById(toUserId);

      if (!fromUser || !toUser) {
        throw Error("Uno o ambos usuarios no existen");
      }

      // PROBLEMA: Si falla aquí, los datos quedan inconsistentes
      await this.unitOfWork.users.update(toUserId, {
        name: fromUser.name,
        email: fromUser.email,
        age: fromUser.age,
      });

      await this.deleteUser(fromUserId);
      return true;
    } catch (error) {
      console.error("Error en transferencia:", error);
      return false;
    }
  }

  // PROBLEMA: Más lógica de negocio mezclada
  async createUserWithValidation(
    userData: CreateUserDto
  ): Promise<User | null> {
    // Validación de negocio mezclada con acceso a datos
    await this.validateUserData(userData);

    return this.unitOfWork.users.create(userData);
  }
  async validateUserData(userData: CreateUserDto): Promise<void> {
    if (userData.age < 0 || userData.age > 150) {
      throw new Error("Edad inválida");
    }

    if (!userData.email.includes("@")) {
      throw new Error("Email inválido");
    }

    // Verificar si el email ya existe
    const existingUsers = await this.getAllUsers();
    const emailExists = existingUsers.some(
      (user) => user.email === userData.email
    );

    if (emailExists) {
      throw new Error("Email ya existe");
    }
  }
  async isEmailUnique(email: string): Promise<boolean> {
    const existingUser = await this.unitOfWork.users.findByEmail(email);
    return existingUser === null;
  }
}
