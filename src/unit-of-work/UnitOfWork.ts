import { IUserRepository } from "../repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { IUnitOfWork } from "./IUnitOfWork";

export class UnitOfWork implements IUnitOfWork {
  // Repositorios
  public users: IUserRepository;
  private db: sqlite3.Database;
  private transactionActive: boolean = false;

  constructor(db: sqlite3.Database) {
    this.db = db;
    this.users = new UserRepository(db);
  }

  // Métodos de transacción
  async beginTransaction(): Promise<void> {
    if (this.transactionActive) throw Error("Error transaction active");
    this.transactionActive = true;
    this.bd("BEGIN TRANSACTION", (err) => {
      if (err) {
        throw new Error(`Error starting transaction: ${err.message}`);
      }
      console.log("Transaction started");
    });
  }
  async commit(): Promise<void> {
    if (this.transactionActive) throw Error("Error transaction active");

    this.bd("COMMIT", (err) => {
      if (err) {
        throw new Error(`Error committing transaction: ${err.message}`);
      }
      this.transactionActive = false;

      console.log("Transaction Comitted");
    });
  }
  async rollback(): Promise<void> {
    if (!this.transactionActive) throw Error("Error transaction not active");

    this.bd("ROLLBACK", (err) => {
      if (err) {
        throw new Error(`Error rolling back transaction: ${err.message}`);
      }
      this.transactionActive = false;

      console.log("Transaction Rolled Back");
    });
  }

  // Método para ejecutar operaciones en una transacción
  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    try {
      this.beginTransaction();
      const result = await operation();
      this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw Error(`Transaction failed: ${error.message}`);
    }
  }
}
