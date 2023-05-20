import { Request, Response } from "express";
import { NextFunction } from "express";

import { Category } from "../../database/entity/Category";
import { CategoryGroup } from "../../database/entity/CategoryGroup";
import { CategoryGroupDTO } from "../../dtos/categoryGroup.dto";
import { AppError } from "../../utils/httpError";
import { customValidator } from "../../utils/validators";
import { CategoryService } from "../services/category.service";
import { CategoryGroupService } from "../services/categoryGroup.service";

export class CategoryGroupController {
  private service: CategoryGroupService;
  private categoryService: CategoryService;

  constructor() {
    this.service = new CategoryGroupService();
    this.categoryService = new CategoryService();
  }

  getById = async (req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const categoryGroup = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          categories: true,
        },
      });
      res.status(200).json(categoryGroup);
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
      const categoryGroup = await this.service.findAll({
        findFields: req.query.name ? { name: req.query.name } : {},
        relations: {
          categories: true,
        },
        page: req.query.page,
        pageCount: req.query.pageCount,
      });
      res.status(200).json(categoryGroup);
    } catch (e) {
      return next(e);
    }
  };

  post = async (
    req: Request<unknown, unknown, { name: string; categories?: { id?: string; name?: string }[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const errors = await customValidator(CategoryGroupDTO, req.body);
      if (errors) {
        return next({
          status: 400,
          message: errors,
        });
      }
      const newCategoryGroup = new CategoryGroup();

      for (const categoryDetail of req.body.categories) {
        if (!newCategoryGroup.categories?.find((ca) => ca.id === categoryDetail.id)) {
          if (categoryDetail.id) {
            const category = await this.categoryService.findOne({
              findFields: {
                id: categoryDetail.id,
              },
            });
            if (category) {
              newCategoryGroup.categories = [...(newCategoryGroup.categories || []), category];
            }
            return next(new AppError("No Category Found", 400));
          } else {
            const newCategory = new Category();
            newCategory.name = categoryDetail.name;
            newCategory.categoryGroupId = newCategoryGroup.id;
            const savedNewCategory = await this.categoryService.save(newCategory);
            newCategoryGroup.categories = [...(newCategoryGroup.categories || []), savedNewCategory];
          }
        }
      }

      newCategoryGroup.name = req.body.name;
      const category = await this.service.save(newCategoryGroup);
      res.status(201).json(category);
    } catch (e) {
      return next(e);
    }
  };

  put = async (
    req: Request<{ id: string }, unknown, { name?: string; categories?: { id?: string; name?: string }[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categoryGroup = await this.service.findOne({
        findFields: {
          id: req.params.id,
        },
        relations: {
          categories: true,
        },
      });
      if (!categoryGroup) {
        return next(new AppError("No Category Group Found", 400));
      }
      if (req.body.name) categoryGroup.name = req.body.name;
      categoryGroup.categories = [];
      for (const categoryDetail of req.body.categories) {
        if (categoryDetail.id) {
          const category = await this.categoryService.findOne({
            findFields: {
              id: categoryDetail.id,
            },
          });
          if (category) {
            categoryGroup.categories = [...(categoryGroup.categories || []), category];
          }
          return next(new AppError("No Category Found", 400));
        } else {
          const newCategory = new Category();
          newCategory.name = categoryDetail.name;
          newCategory.categoryGroupId = categoryGroup.id;
          const savedNewCategory = await this.categoryService.save(newCategory);
          categoryGroup.categories = [...(categoryGroup.categories || []), savedNewCategory];
        }
      }

      const updatedCategoryGroup = await this.service.save(categoryGroup);
      return res.status(200).json(updatedCategoryGroup);
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
        return next(new AppError("No Category Group Found", 400));
      }

      await this.service.remove(category);
      return res.status(200).json("Deleted");
    } catch (e) {
      return next(e);
    }
  };
}
