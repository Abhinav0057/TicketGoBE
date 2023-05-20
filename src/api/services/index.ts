import bcrypt from "bcrypt";
import {
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

import { AppDataSource } from "../../database/config";
import { Auth } from "../../database/entity/Auth";
import { Category } from "../../database/entity/Category";
import { CategoryGroup } from "../../database/entity/CategoryGroup";
import { Company } from "../../database/entity/Company";
import { Event } from "../../database/entity/Event";
import { Tickets } from "../../database/entity/Tickets";
import { User } from "../../database/entity/User";

type Entities = User | Event | Category | CategoryGroup | Tickets | Auth | Company;
export class Service<T extends Entities> {
  repository: Repository<T>;

  protected queryRunner = AppDataSource.createQueryRunner();

  constructor(repo: EntityTarget<T>) {
    this.repository = AppDataSource.getRepository<T>(repo);
  }

  findOne = async ({
    findFields,
    relations,
    select,
  }: {
    findFields?: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    select?: FindOptionsSelect<T>;
  }) => {
    const findOptions = {
      where: findFields,
      relations,
      select,
    };
    return await this.repository.findOne(findOptions as FindOneOptions<T>);
  };

  findAll = async ({
    findFields,
    relations,
    select,
    pageCount,
    page,
  }: {
    findFields?: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    select?: FindOptionsSelect<T>;
    pageCount?: number;
    page?: number;
  }) => {
    const findOptions: FindManyOptions<Entities> = {
      relations,
      where: findFields,
      select,
      ...(pageCount && page && { skip: page * pageCount, take: pageCount }),
    };
    return await this.repository.findAndCount(findOptions as FindManyOptions<T>);
  };
  save = async (fields: T) => {
    return await this.repository.save(fields);
  };

  create = async (fields: QueryDeepPartialEntity<T>[]) => {
    await this.repository.insert(fields);
  };
  remove = async (row: T) => {
    await this.repository.remove(row);
  };
}
