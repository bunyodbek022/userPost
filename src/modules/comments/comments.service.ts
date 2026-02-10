import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
    ) { }

    async create(dto: CreateCommentDto, user: AuthUser) {
        const comment = await this.commentModel.create({
            content: dto.content,
            post: new Types.ObjectId(dto.post),
            author: new Types.ObjectId(user.id),
        });

        const populated = await this.commentModel
            .findById(comment._id)
            .populate('author', 'userName avatar')
            .exec();

        return {
            success: true,
            data: populated,
        };
    }

    async findByPost(postId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = { post: new Types.ObjectId(postId) };

        const [items, total] = await Promise.all([
            this.commentModel
                .find(filter)
                .populate('author', 'userName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.commentModel.countDocuments(filter),
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

    async remove(commentId: string, user: AuthUser) {
        const comment = await this.commentModel.findById(commentId);
        if (!comment) throw new NotFoundException('Izoh topilmadi');

        const isAdmin = user.role === UserRole.ADMIN;
        const isOwner = comment.author.toString() === String(user.id);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("Sizda bu izohni o'chirish huquqi yo'q");
        }

        await this.commentModel.findByIdAndDelete(commentId);
        return { success: true, message: "Izoh muvaffaqiyatli o'chirildi" };
    }
}
