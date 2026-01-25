import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Posts } from './schema/post.schema';
import { Model, Types } from 'mongoose';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Posts.name) private postModel: Model<Posts>) {}
  async create(payload: CreatePostDto, user: AuthUser) {
    const newPost = await this.postModel.create({
      ...payload,
      author: new Types.ObjectId(user.id),
    });
    return {
      success: true,
      data: newPost,
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post topilmadi');
    const index = post.likes.indexOf(userId as any);

    if (index === -1) {
      post.likes.push(userId as any);
    } else {
      post.likes.splice(index, 1);
    }
    return post.save();
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const filter: any = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: 'i',
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter, { title: 1, createdAt: 1 })
        .populate('author', 'userName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.postModel.countDocuments(),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyPosts(page = 1, limit = 10, user: { id: string }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.postModel
        .find(
          { author: new Types.ObjectId(user.id) },
          { title: 1, createdAt: 1 },
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.postModel.countDocuments(),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'userName')
      .exec();
    if (!post) throw new NotFoundException('Post topilmadi');
    return {
      success: true,
      data: post,
    };
  }

  async updatePost(postId: string, dto: UpdatePostDto, user: AuthUser) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post topilmadi');

    const isAdmin = user.role === UserRole.ADMIN;
    const isModerator = user.role === UserRole.MODERATOR;
    const isOwner = post.author.toString() === String(user.id);

    if (!isAdmin && !isModerator && !isOwner) {
      throw new ForbiddenException("Sizda bu postni o'zgartirish huquqi yo'q");
    }

    if (isModerator && !isOwner) {
      throw new ForbiddenException("Sizda bu postni o'zgartirish huquqi yo'q");
    }

    const updatedData = await this.postModel.findByIdAndUpdate(postId, dto, {
      new: true,
    });

    return {
      success: true,
      message: 'Post updated successfully',
      data: updatedData,
    };
  }

  async removePost(postId: string, user: AuthUser) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post topilmadi');

    const isAdmin = user.role === UserRole.ADMIN;
    const isModerator = user.role === UserRole.MODERATOR;
    const isOwner = post.author.toString() === String(user.id);

    if (!isAdmin && !isModerator && !isOwner) {
      throw new ForbiddenException("Sizda bu postni o'chirish huquqi yo'q");
    }

    await this.postModel.findByIdAndDelete(postId);
    return { success: true, message: "Post muvaffaqiyatli o'chirildi" };
  }
}
