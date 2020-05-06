import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 1, username: 'Test user' };

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
});

describe('TasksService', () => {
    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository }
            ],
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('should get all tasks from the repository', async () => {
            taskRepository.getTasks.mockResolvedValue('some value');
            expect(taskRepository.getTasks).not.toHaveBeenCalled();

            const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'some' };

            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('some value');
        });
    });

    describe('getTaskById', () => {
        it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
            const mockTask = { title: 'Test task', description: 'Test description' };
            taskRepository.findOne.mockResolvedValue(mockTask);

            const result = await taskRepository.findOne({ where: {id: 1, userId: mockUser.id }});
            expect(result).toEqual(mockTask);

            expect(taskRepository.findOne).toHaveBeenCalledWith({ where: {
                id: 1,
                userId: mockUser.id
            }});
        });

        it('throws an error as task is not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow();
        });
    });

    describe('createTask', () => {
        it('calls taskRepository.createTask() and returns the result', async () => {
            taskRepository.createTask.mockResolvedValue('some task');
            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const createTaskDto = { title: 'Test', description: 'Desc' };
            const result = await tasksService.createTask(createTaskDto, mockUser);
            expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('some task');
        })
    });

    describe('deleteTask', () => {
        it('calls taskRepository.delete() to delete a task', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 1 });
            expect(taskRepository.delete).not.toHaveBeenCalled();
            await tasksService.deleteTask(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });

        it('throws an error as task is not found', () => {
            taskRepository.delete.mockResolvedValue({ affected: 0 });
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTaskStatus', () => {
        it('calls taskRepository.update() to update a task status', async () => {
            taskRepository.update.mockResolvedValue({ affected: 1 });
            expect(taskRepository.update).not.toHaveBeenCalled();
            await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(taskRepository.update).toHaveBeenCalledWith({ id: 1, userId: mockUser.id }, { status: TaskStatus.DONE });
        });

        it('throws an error as task is not found', () => {
            taskRepository.delete.mockResolvedValue({ affected: 0 });
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });
});
