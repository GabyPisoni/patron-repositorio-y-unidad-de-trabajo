import sqlite3 from 'sqlite3';
import { Database } from './database/Database';
import { User, CreateUserDto, UpdateUserDto } from './models/User';
import { UnitOfWork } from './unit-of-work/UnitOfWork';
import { UserService } from './services/UserService';

// PROBLEMA: Código acoplado directamente a la base de datos
// PROBLEMA: Lógica de negocio mezclada con acceso a datos
// PROBLEMA: No hay transacciones para operaciones complejas
// PROBLEMA: Difícil de testear



// Función principal para demostrar los problemas
async function main() {
  // const userManager = new UserManager();

    const database = new Database();
    const unitOfWork = new UnitOfWork(database.getDatabase());
    const userService = new UserService(unitOfWork);
  try {
    console.log('=== Creando usuarios ===');
    
    const user1 = await userService.createUserWithValidation({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      age: 25
    });
    console.log('Usuario creado:', user1);

    const user2 = await userService.createUserWithValidation({
      name: 'María García',
      email: 'maria@example.com',
      age: 30
    });
    console.log('Usuario creado:', user2);

    console.log('\n=== Listando todos los usuarios ===');
    const allUsers = await userService.getAllUsers();
    console.log('Usuarios:', allUsers);

    console.log('\n=== Actualizando usuario ===');
    const updatedUser = await userService.updateUser(user1!.id!, {
      name: 'Juan Carlos Pérez',
      age: 26
    });
    console.log('Usuario actualizado:', updatedUser);

    console.log('\n=== Transferencia de datos (operación problemática) ===');
    const transferResult = await userService.transferUserData(user1!.id!, user2!.id!);
    console.log('Transferencia exitosa:', transferResult);

    console.log('\n=== Estado final ===');
    const finalUsers = await userService.getAllUsers();
    console.log('Usuarios finales:', finalUsers);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la aplicación
if (require.main === module) {
  main().catch(console.error);
} 