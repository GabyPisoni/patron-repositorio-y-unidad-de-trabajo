// EJEMPLO: Así debería verse el index.ts después del refactoring
// Este archivo es solo para referencia, no es parte del ejercicio

import { Database } from '../database/Database';
import { UnitOfWork } from './UnitOfWork';
import { UserService } from './UserService';

// EJEMPLO: Aplicación refactorizada usando Repository + Unit of Work
async function main() {
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
    const updatedUser = await userService.updateUser(user1.id!, {
      name: 'Juan Carlos Pérez',
      age: 26
    });
    console.log('Usuario actualizado:', updatedUser);

    console.log('\n=== Transferencia de datos (con transacciones) ===');
    const transferResult = await userService.transferUserData(user1.id!, user2.id!);
    console.log('Transferencia exitosa:', transferResult);

    console.log('\n=== Estado final ===');
    const finalUsers = await userService.getAllUsers();
    console.log('Usuarios finales:', finalUsers);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    database.close();
  }
}

// Ejecutar la aplicación
if (require.main === module) {
  main().catch(console.error);
} 