import sqlite3 from 'sqlite3';
import { Database } from './database/Database';
import { User, CreateUserDto, UpdateUserDto } from './models/User';

// PROBLEMA: Código acoplado directamente a la base de datos
// PROBLEMA: Lógica de negocio mezclada con acceso a datos
// PROBLEMA: No hay transacciones para operaciones complejas
// PROBLEMA: Difícil de testear

class UserManager {
  private db: sqlite3.Database;

  constructor() {
    const database = new Database();
    this.db = database.getDatabase();
  }

  // PROBLEMA: Acceso directo a la base de datos sin abstracción
  async createUser(userData: CreateUserDto): Promise<User> {
   
  }

  // PROBLEMA: Código duplicado para acceso a datos
  async getUserById(id: number): Promise<User | null> {
    
  }

  // PROBLEMA: Más código duplicado
  async getAllUsers(): Promise<User[]> {
   
  }

  // PROBLEMA: Lógica de negocio mezclada con acceso a datos
  async updateUser(id: number, userData: UpdateUserDto): Promise<User | null> {
  
  
  }

  // PROBLEMA: No hay transacciones para operaciones complejas
  async deleteUser(id: number): Promise<boolean> {
   
  }

  // PROBLEMA: Operación compleja sin transacciones
  async transferUserData(fromUserId: number, toUserId: number): Promise<boolean> {
    try {
      const fromUser = await this.getUserById(fromUserId);
      const toUser = await this.getUserById(toUserId);

      if (!fromUser || !toUser) {
        return false;
      }

      // PROBLEMA: Si falla aquí, los datos quedan inconsistentes
      await this.updateUser(toUserId, {
        name: fromUser.name,
        email: fromUser.email,
        age: fromUser.age
      });

      await this.deleteUser(fromUserId);
      return true;
    } catch (error) {
      console.error('Error en transferencia:', error);
      return false;
    }
  }

  // PROBLEMA: Más lógica de negocio mezclada
  async createUserWithValidation(userData: CreateUserDto): Promise<User | null> {
    // Validación de negocio mezclada con acceso a datos
    if (userData.age < 0 || userData.age > 150) {
      throw new Error('Edad inválida');
    }

    if (!userData.email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Verificar si el email ya existe
    const existingUsers = await this.getAllUsers();
    const emailExists = existingUsers.some(user => user.email === userData.email);
    
    if (emailExists) {
      throw new Error('Email ya existe');
    }

    return this.createUser(userData);
  }
}

// Función principal para demostrar los problemas
async function main() {
  const userManager = new UserManager();

  try {
    console.log('=== Creando usuarios ===');
    
    const user1 = await userManager.createUserWithValidation({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      age: 25
    });
    console.log('Usuario creado:', user1);

    const user2 = await userManager.createUserWithValidation({
      name: 'María García',
      email: 'maria@example.com',
      age: 30
    });
    console.log('Usuario creado:', user2);

    console.log('\n=== Listando todos los usuarios ===');
    const allUsers = await userManager.getAllUsers();
    console.log('Usuarios:', allUsers);

    console.log('\n=== Actualizando usuario ===');
    const updatedUser = await userManager.updateUser(user1!.id!, {
      name: 'Juan Carlos Pérez',
      age: 26
    });
    console.log('Usuario actualizado:', updatedUser);

    console.log('\n=== Transferencia de datos (operación problemática) ===');
    const transferResult = await userManager.transferUserData(user1!.id!, user2!.id!);
    console.log('Transferencia exitosa:', transferResult);

    console.log('\n=== Estado final ===');
    const finalUsers = await userManager.getAllUsers();
    console.log('Usuarios finales:', finalUsers);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la aplicación
if (require.main === module) {
  main().catch(console.error);
} 