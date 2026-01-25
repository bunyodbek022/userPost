import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';

@ApiTags('Categories')
@ApiSecurity('cookie-auth-key')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi kategoriya yaratish (Faqat Admin)' })
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kategoriyalarni korish (Hamma uchun)' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategoriyani o\'chirish (Faqat Admin)' })
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}