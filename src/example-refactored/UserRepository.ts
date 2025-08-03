// EJEMPLO: Así debería verse el UserRepository después del refactoring
// Este archivo es solo para referencia, no es parte del ejercicio

import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../models/User';
import sqlite3 from 'sqlite3';

export class UserRepository implements IUserRepository {
  constructor(private db: sqlite3.Database) {}

  async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err: sqlite3.Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            resolve(null);
            return;
          }
          resolve(this.mapRowToUser(row));
        }
      );
    });
  }

  async findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users ORDER BY createdAt DESC',
        (err: sqlite3.Error | null, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          const users = rows.map(row => this.mapRowToUser(row));
          resolve(users);
        }
      );
    });
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.age, user.createdAt.toISOString(), user.updatedAt.toISOString()],
        function(this: sqlite3.RunResult, err: sqlite3.Error | null) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ ...user, id: this.lastID });
        }
      );
    });
  }

  async update(id: number, user: Partial<User>): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };

    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET name = ?, email = ?, age = ?, updatedAt = ? WHERE id = ?',
        [updatedUser.name, updatedUser.email, updatedUser.age, updatedUser.updatedAt.toISOString(), id],
        (err: sqlite3.Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(updatedUser);
        }
      );
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(this: sqlite3.RunResult, err: sqlite3.Error | null) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err: sqlite3.Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            resolve(null);
            return;
          }
          resolve(this.mapRowToUser(row));
        }
      );
    });
  }

  async findByAgeRange(minAge: number, maxAge: number): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users WHERE age BETWEEN ? AND ? ORDER BY age',
        [minAge, maxAge],
        (err: sqlite3.Error | null, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          const users = rows.map(row => this.mapRowToUser(row));
          resolve(users);
        }
      );
    });
  }

  async findUsersCreatedAfter(date: Date): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users WHERE createdAt > ? ORDER BY createdAt DESC',
        [date.toISOString()],
        (err: sqlite3.Error | null, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          const users = rows.map(row => this.mapRowToUser(row));
          resolve(users);
        }
      );
    });
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      age: row.age,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
} 