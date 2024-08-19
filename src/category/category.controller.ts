import { Controller, Get, Param, Post, Render, Req, Res } from "@nestjs/common";
import { CategoryService } from "./category.service";

@Controller()
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) { }

    @Get('category/:url')
    async getCategoryReports(@Param() pram, @Res() res) {
        // let categoryReports = await this.categoryService.getCategoryReports(pram.url);
        // let categories = await this.categoryService.getAllCategories();

        // return {
        //     categoryReports: categoryReports.reports,
        //     categories,
        //     breadCrumb: categoryReports.category[0].title,
        //     metatitle: `Get All Trending Reports On ${categoryReports.category[0].title} Industry | Vantage Market Research`
        // }

        res.redirect(301, '/categories/' + pram.url);
    }

    @Get('categories/:url')
    @Render('allreports_new')
    async getSubCategories(@Param() pram) {

        console.log("Input", pram.url);
        let subcategories: any = await this.categoryService.getCategory(pram.url);
        console.log("Searching for Cateogries ", subcategories);

        if (!subcategories) {
            subcategories = await this.categoryService.getCategoryReports(pram.url);
        }

        return {
            ...subcategories,
            breadCrumb: subcategories.title ?? subcategories.parentCategory[0].title,
            title: `${subcategories.title ?? subcategories.category[0].title} Market Research Reports`,
            metatitle: `${(subcategories.title ?? subcategories.category[0].title).replace(/\sIndustry/gmi, '')} Industry Research Reports`,
            metadescription: `${subcategories.title ?? subcategories.category[0].title} Industry Research Reports`,
            metakeywords: `${subcategories.title ?? subcategories.category[0].title} Industry Research Reports, ${subcategories.title ?? subcategories.category[0].title} Market Research Reports`
        };
    }

    @Get('/categories')
    async getAllParentCategories() {
        return await this.categoryService.getAllParentCategories();
    }

    @Get('/subcategories/:url')
    async getSubCategoriesJson(@Param() pram) {
        return await this.categoryService.getSubScategories(pram.url);
    }

    @Get('parent-category-json/:url')
    async getParentCategory(@Param() pram) {
        return await this.categoryService.getParentCategory(pram.url);
    }

    @Post('/get-category-wise-reports-json')
    async getCategoryWiseReports(@Req() req) {
        return await this.categoryService.getReportsByCategory({ ...req.body });
    }

}