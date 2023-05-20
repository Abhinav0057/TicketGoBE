import { Request, Response } from "express";
import { NextFunction } from "express";

import { Category } from "../../database/entity/Category";
import { AppError } from "../../utils/httpError";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  getById = async (req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });
      res.status(200).json(category);
    } catch (e) {
      return next(e);
    }
  };

  get = async (
    req: Request<unknown, unknown, unknown, { name?: string; page?: number; pageCount?: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categories = await this.service.findAll({
        findFields: req.query.name ? { name: req.query.name } : {},
        page: req.query.page,
        pageCount: req.query.pageCount,
      });
      res.status(200).json(categories);
    } catch (e) {
      return next(e);
    }
  };

  post = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
    try {
      const newCategory = new Category();
      newCategory.name = req.body.name;
      newCategory.categoryGroupId = req.body.categoryGroupId;
      const category = await this.service.save(newCategory);
      res.status(201).json(category);
    } catch (e) {
      return next(e);
    }
  };

  put = async (req: Request<{ id: string }, unknown, { name?: string }>, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });
      if (!category) {
        return next(new AppError("No Category Found", 400));
      }
      if (req.body.name) category.name = req.body.name;

      const updatedCategory = await this.service.save(category);
      return res.status(200).json(updatedCategory);
    } catch (e) {
      return next(e);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
      });
      if (!category) {
        return next(new AppError("No Category Found", 400));
      }

      await this.service.remove(category);
      return res.status(200).json("Deleted");
    } catch (e) {
      return next(e);
    }
  };
}
