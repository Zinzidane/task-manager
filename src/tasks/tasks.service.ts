import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { UpdateResult, DeleteResult } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ) {}

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user);
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        const found = await this.taskRepository.findOne({ where: { id, userId: user.id } });

        if (!found) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return found;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }

    async deleteTask(id: number, user: User): Promise<DeleteResult> {
        const deleteResult = await this.taskRepository.delete({id, userId: user.id});

        if(deleteResult.affected === 0) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return deleteResult;
    }

    async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<UpdateResult> {
        const updateResult = await this.taskRepository.update({id, userId: user.id}, {status});

        if (updateResult.affected === 0) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return updateResult;
    }
}
