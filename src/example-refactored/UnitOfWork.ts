// EJEMPLO: Así debería verse el UnitOfWork después del refactoring
// Este archivo es solo para referencia, no es parte del ejercicio

import { IUnitOfWork } from '../unit-of-work/IUnitOfWork';
import { IUserRepository } from '../repositories/IUserRepository';
import { UserRepository } from '../repositories/UserRepository';
import sqlite3 from 'sqlite3';

export class UnitOfWork implements IUnitOfWork {
  public users: IUserRepository;
  private db: sqlite3.Database;
  private transactionActive: boolean = false;

  constructor(db: sqlite3.Database) {
    this.db = db;
    this.users = new UserRepository(db);
  }

  async beginTransaction(): Promise<void> {
    if (this.transactionActive) {
      throw new Error('Ya hay una transacción activa');
    }

    return new Promise((resolve, reject) => {
      this.db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
        } else {
          this.transactionActive = true;
          resolve();
        }
      });
    });
  }

  async commit(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('No hay transacción activa para hacer commit');
    }

    return new Promise((resolve, reject) => {
      this.db.run('COMMIT', (err) => {
        if (err) {
          reject(err);
        } else {
          this.transactionActive = false;
          resolve();
        }
      });
    });
  }

  async rollback(): Promise<void> {
    if (!this.transactionActive) {
      throw new Error('No hay transacción activa para hacer rollback');
    }

    return new Promise((resolve, reject) => {
      this.db.run('ROLLBACK', (err) => {
        if (err) {
          reject(err);
        } else {
          this.transactionActive = false;
          resolve();
        }
      });
    });
  }

  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.beginTransaction();
      const result = await operation();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
} 