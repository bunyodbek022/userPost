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
import { Category } from '../category/schema/category.schema';
import { Comment } from '../comments/schema/comment.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) { }
  async create(payload: CreatePostDto, user: AuthUser) {
    const newPost = await this.postModel.create({
      ...payload,
      author: new Types.ObjectId(user.id),
      categories: payload.categories.map((id) => new Types.ObjectId(id)),
    });
    const populatedPost = await this.postModel
      .findById(newPost._id)
      .populate('author', 'userName role')
      .populate('categories', 'name');

    return {
      success: true,
      data: populatedPost || newPost,
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post topilmadi');

    const index = post.likes.findIndex(
      (id) => id.toString() === String(userId),
    );

    if (index === -1) {
      post.likes.push(userId as any);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    const updatedPost = await this.postModel
      .findById(postId)
      .populate('author', 'userName role')
      .populate('categories')
      .exec();

    return {
      success: true,
      data: updatedPost,
    };
  }

  async toggleDislike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post topilmadi');

    // Remove from likes if present (mutual exclusion)
    const likeIndex = post.likes.findIndex(
      (id) => id.toString() === String(userId),
    );
    if (likeIndex !== -1) {
      post.likes.splice(likeIndex, 1);
    }

    const index = post.dislikes.findIndex(
      (id) => id.toString() === String(userId),
    );

    if (index === -1) {
      post.dislikes.push(userId as any);
    } else {
      post.dislikes.splice(index, 1);
    }

    await post.save();

    const updatedPost = await this.postModel
      .findById(postId)
      .populate('author', 'userName role')
      .populate('categories')
      .exec();

    return {
      success: true,
      data: updatedPost,
    };
  }

  async findAll(page = 1, limit = 10, search?: string, category?: string, author?: string, sort?: string) {
    const filter: any = {};

    if (author) {
      filter.author = new Types.ObjectId(author);
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All' && category !== 'undefined') {
      const isObjectId = Types.ObjectId.isValid(category);
      if (isObjectId) {
        filter.categories = new Types.ObjectId(category);
      } else {
        const cat = await this.categoryModel
          .findOne({ name: category })
          .select('_id')
          .lean();
        if (cat) {
          filter.categories = cat._id;
        } else {
          filter.categories = new Types.ObjectId('000000000000000000000000');
        }
      }
    }

    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      // Sort by likes array length (top liked first)
      // Standard Mongoose sort doesn't support array length directly easily without aggregation
      // But for simplicity in this codebase structure:
      // We can use aggregation or just sort by createdAt for now if we don't want to change to aggregate
      // Let's use a simple aggregation pipeline for popular posts if possible, or
      // fallback to sorting by a virtual or computed field.
      // Given the constraints and current implementation using `find`, let's try to stick to `find` with a hack or switch to aggregate.
      // Actually, for "Top Posts", aggregation is best.
      // Let's switch to aggregation for popular sort, or just simple find if sort is not popular.
    }

    // Since switching to aggregation might break pagination and population structures quickly without
    // bigger refactor, let's use a simpler approach:
    // If 'popular', we fetch and sort in memory if the dataset is small, OR use aggregate.
    // Let's use aggregate for everything to be consistent? No, that changes return structure.

    // Modification: Use aggregate if sort is popular, otherwise find.

    if (sort === 'popular') {
      const [items, total] = await Promise.all([
        this.postModel.aggregate([
          { $match: filter },
          { $addFields: { likesCount: { $size: "$likes" } } },
          { $sort: { likesCount: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
          { $unwind: '$author' },
          { $lookup: { from: 'categories', localField: 'categories', foreignField: '_id', as: 'categories' } },
          { $lookup: { from: 'comments', localField: '_id', foreignField: 'post', as: '_comments' } },
          { $addFields: { commentCount: { $size: '$_comments' } } },
          {
            $project: {
              title: 1, content: 1, coverImage: 1, createdAt: 1, likes: 1, dislikes: 1, commentCount: 1,
              "author.userName": 1, "author.role": 1, "author._id": 1, "author.avatar": 1,
              "categories.name": 1, "categories._id": 1
            }
          }
        ]),
        this.postModel.countDocuments(filter)
      ]);
      return {
        success: true,
        data: items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    }


    const [items, total] = await Promise.all([
      this.postModel.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        { $lookup: { from: 'categories', localField: 'categories', foreignField: '_id', as: 'categories' } },
        { $lookup: { from: 'comments', localField: '_id', foreignField: 'post', as: '_comments' } },
        { $addFields: { commentCount: { $size: '$_comments' } } },
        {
          $project: {
            title: 1, content: 1, coverImage: 1, createdAt: 1, likes: 1, dislikes: 1, commentCount: 1,
            'author.userName': 1, 'author.role': 1, 'author._id': 1, 'author.avatar': 1,
            'categories.name': 1, 'categories._id': 1
          }
        }
      ]),
      this.postModel.countDocuments(filter),
    ]);

    return {
      success: true,
      data: items,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyPosts(page = 1, limit = 10, user: { id: string }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.postModel
        .find(
          { author: new Types.ObjectId(user.id) },
          { title: 1, createdAt: 1, coverImage: 1, content: 1, likes: 1 },
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
      .populate('author', 'userName role')
      .populate('categories')
      .exec();

    if (!post) throw new NotFoundException('Post topilmadi');

    const commentCount = await this.commentModel.countDocuments({ post: new Types.ObjectId(id) });

    return {
      success: true,
      data: { ...post.toObject(), commentCount },
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
