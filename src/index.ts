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
    return new Promise((resolve, reject) => {
      const now = new Date();
      const user: User = {
        name: userData.name,
        email: userData.email,
        age: userData.age,
        createdAt: now,
        updatedAt: now
      };

      this.db.run(
        'INSERT INTO users (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.age, user.createdAt.toISOString(), user.updatedAt.toISOString()],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          user.id = this.lastID;
          resolve(user);
        }
      );
    });
  }

  // PROBLEMA: Código duplicado para acceso a datos
  async getUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            resolve(null);
            return;
          }
          resolve({
            id: row.id,
            name: row.name,
            email: row.email,
            age: row.age,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
          });
        }
      );
    });
  }

  // PROBLEMA: Más código duplicado
  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users ORDER BY createdAt DESC',
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          const users: User[] = rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            age: row.age,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
          }));
          resolve(users);
        }
      );
    });
  }

  // PROBLEMA: Lógica de negocio mezclada con acceso a datos
  async updateUser(id: number, userData: UpdateUserDto): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };

    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET name = ?, email = ?, age = ?, updatedAt = ? WHERE id = ?',
        [updatedUser.name, updatedUser.email, updatedUser.age, updatedUser.updatedAt.toISOString(), id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(updatedUser);
        }
      );
    });
  }

  // PROBLEMA: No hay transacciones para operaciones complejas
  async deleteUser(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
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