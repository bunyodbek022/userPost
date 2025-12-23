import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Posts } from './schema/post.schema';
import { Model } from 'mongoose';


@Injectable()
export class PostsService {
  constructor(@InjectModel(Posts.name) private  postModel: Model<Posts>){}
  async create(payload: CreatePostDto) {
    const newPost = new this.postModel(payload)
    const post = await newPost.save()
    return {
      success: true,
      data: post
    }
  }

  async findAll() {
    const posts = await this.postModel.find().populate('author', 'name').exec();
    return {
      success: true,
      data: posts
    }
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate('author').exec()
    if (!post) throw new NotFoundException('Post topilmadi');
    return {
      success: true,
      data: post
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updatedData = await this.postModel.findByIdAndUpdate(id, updatePostDto, {new : true})
    return {
      success: true,
      message: 'Post updated successfully',
      data: updatedData
    }
  }

  async remove(id: string) {
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    return {
      success: true,
      message: "User deleted successfully"
    }
  }
}
