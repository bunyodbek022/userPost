import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const exists = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (exists) {
      throw new ConflictException('Bunday kategoriya allaqachon mavjud');
    }
    return new this.categoryModel(createCategoryDto).save();
  }

  async findAll() {
    return this.categoryModel.find().exec();
  }

  async update(id: string, updateCategoryDto: { name: string }) {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Kategoriya topilmadi (ID: ${id})`);
    }
    return { success: true, data: updatedCategory };
  }

  async remove(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Kategoriya topilmadi');
    }
    return { message: 'Kategoriya muvaffaqiyatli o‘chirildi' };
  }
}
