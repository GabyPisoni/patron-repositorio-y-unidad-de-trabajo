import { Database } from "../database/Database";
import { User } from "../models/User";
import { IUserRepository } from "./IUserRepository";
import sqlite3 from 'sqlite3';


export class UserRepository implements IUserRepository {
  constructor(private db: sqlite3.Database) {
    const database = new Database();
    this.db = database.getDatabase()
  }
  async findUsersCreatedAfter(date: Date): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users WHERE createdAt > ? ORDER BY createdAt DESC', [date.toISOString()],
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
  async findAll(): Promise<User[]> {
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
  async findById(entityId: number, propSearch = "id"): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        ` SELECT * FROM users WHERE ${propSearch} = ?`,
        [entityId],
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
  async findByEmail(email: string): Promise<User | null> {

    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
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
  async findByAgeRange(minAge: number, maxAge: number): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM users WHERE age BETWEEN ? AND ? ORDER BY age', [minAge, maxAge],
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
  async create(entity: Omit<User, "id">): Promise<User> {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const user: User = {
        name: entity.name,
        email: entity.email,
        age: entity.age,
        createdAt: now,
        updatedAt: now
      };

      this.db.run(
        'INSERT INTO users (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.age, user.createdAt.toISOString(), user.updatedAt.toISOString()],
        function (err) {
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
  async update(id: number, entity: Partial<User>): Promise<User | null> {
    // Primero obtener el usuario actual
    const currentUser = await this.findById(id);
    if (!currentUser) {
      return null;
    }

    // Combinar los datos actuales con los nuevos datos
    const updatedUser: User = {
      ...currentUser,
      ...entity,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET name = ?, email = ?, age = ?, updatedAt = ? WHERE id = ?',
        [updatedUser.name, updatedUser.email, updatedUser.age, updatedUser.updatedAt.toISOString(), id],
        function (err) {
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
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }
}
