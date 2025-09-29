import type { Table } from 'dexie';
import type { IRepository } from '@storage/types/adapters';

/**
 * Base repository implementation with common CRUD operations
 */
export abstract class BaseRepository<T extends { id: string; createdAt: Date; updatedAt: Date }>
  implements IRepository<T>
{
  constructor(protected table: Table<T, string>) {}

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEntity = {
      ...entity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as T;
    await this.table.add(fullEntity);
    return fullEntity;
  }

  async getById(id: string): Promise<T | null> {
    const entity = await this.table.get(id);
    return entity || null;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    await this.table.update(id, { ...updates, updatedAt: new Date() } as any);
    const updated = await this.table.get(id);
    if (!updated) {
      throw new Error(`Entity ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async createMany(entities: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const fullEntities = entities.map((entity) => ({
      ...entity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as T[];
    await this.table.bulkAdd(fullEntities);
    return fullEntities;
  }

  async updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<void> {
    for (const { id, data } of updates) {
      await this.update(id, data);
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.table.bulkDelete(ids);
  }

  async getAll(): Promise<T[]> {
    return await this.table.toArray();
  }

  async count(): Promise<number> {
    return await this.table.count();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.table.where('id').equals(id).count();
    return count > 0;
  }
}