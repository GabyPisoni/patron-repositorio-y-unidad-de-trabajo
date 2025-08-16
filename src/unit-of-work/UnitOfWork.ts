import { IUserRepository } from "../repositories/IUserRepository";
import { IUnitOfWork } from "./IUnitOfWork";

export class UnitOfWork implements IUnitOfWork {
  // Repositorios
  public users: IUserRepository;
  private bd: sqlite3.Database;

  // Métodos de transacción
  async beginTransaction(): Promise<void> {
    this.bd("BEGIN TRANSACTION", (err) => {
      if (err) {
        throw new Error(`Error starting transaction: ${err.message}`);
      }
      console.log("Transaction started");
    });
  }
  async commit(): Promise<void> {
    this.bd("COMMIT", (err) => {
      if (err) {
        throw new Error(`Error committing transaction: ${err.message}`);
      }
      console.log("Transaction Comitted");
    });
  }
  async rollback(): Promise<void> {
    this.bd("ROLLBACK", (err) => {
      if (err) {
        throw new Error(`Error rolling back transaction: ${err.message}`);
      }
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
