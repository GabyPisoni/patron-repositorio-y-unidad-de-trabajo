# Ejercicio: Patrón Repository + Unit of Work

## Descripción del Ejercicio

Este ejercicio te ayudará a practicar la implementación del patrón Repository junto con el patrón Unit of Work en TypeScript. El código actual tiene problemas de diseño que necesitas refactorizar.

## Problemas Actuales

1. **Acoplamiento directo con la base de datos**: El código accede directamente a SQLite sin abstracción
2. **Falta de transacciones**: No hay manejo de transacciones para operaciones complejas
3. **Código duplicado**: Lógica de acceso a datos repetida en múltiples lugares
4. **Difícil testing**: El código es difícil de testear debido al acoplamiento
5. **Falta de separación de responsabilidades**: La lógica de negocio está mezclada con el acceso a datos

## Objetivos del Refactoring

### 1. Implementar el Patrón Repository
- Crear interfaces `IRepository<T>` y `IUserRepository`
- Implementar `UserRepository` que implemente estas interfaces
- Abstraer el acceso a datos de la lógica de negocio

### 2. Implementar el Patrón Unit of Work
- Crear interfaz `IUnitOfWork`
- Implementar `UnitOfWork` que maneje transacciones
- Coordinar múltiples repositorios en una sola transacción

### 3. Mejorar la Arquitectura
- Separar la lógica de negocio en servicios
- Crear interfaces para facilitar testing
- Implementar inyección de dependencias básica

## Estructura de Archivos

```
src/
├── models/
│   ├── User.ts
│   └── interfaces.ts
├── repositories/
│   ├── IRepository.ts
│   ├── IUserRepository.ts
│   └── UserRepository.ts
├── unit-of-work/
│   ├── IUnitOfWork.ts
│   └── UnitOfWork.ts
├── services/
│   ├── IUserService.ts
│   └── UserService.ts
├── database/
│   └── Database.ts
└── index.ts
```

## Tareas de Refactoring

### Fase 1: Crear Interfaces y Repositorios
1. Crear `IRepository<T>` con métodos CRUD básicos
2. Crear `IUserRepository` que extienda `IRepository<User>`
3. Implementar `UserRepository` que use la base de datos SQLite

### Fase 2: Implementar Unit of Work
1. Crear `IUnitOfWork` con métodos para manejar transacciones
2. Implementar `UnitOfWork` que coordine repositorios
3. Asegurar que las operaciones sean atómicas

### Fase 3: Crear Servicios
1. Crear `IUserService` para la lógica de negocio
2. Implementar `UserService` que use repositorios y unit of work
3. Refactorizar `index.ts` para usar los nuevos servicios

### Fase 4: Testing
1. Crear tests unitarios para repositorios
2. Crear tests para unit of work
3. Crear tests de integración

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar el código actual (con problemas)
npm run dev

# Después del refactoring, ejecutar tests
npm test
```

## Criterios de Éxito

✅ El código debe usar el patrón Repository para acceso a datos
✅ El código debe usar el patrón Unit of Work para transacciones
✅ Las operaciones complejas deben ser atómicas
✅ El código debe ser fácilmente testeable
✅ La lógica de negocio debe estar separada del acceso a datos
✅ Debe haber interfaces claras para facilitar testing

## Pistas

1. Empieza creando las interfaces antes que las implementaciones
2. Usa inyección de dependencias para facilitar testing
3. Piensa en cómo manejar las transacciones cuando hay múltiples repositorios
4. Considera usar un contenedor de dependencias simple

¡Buena suerte con el refactoring! 