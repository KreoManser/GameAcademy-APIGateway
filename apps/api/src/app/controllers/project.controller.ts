// import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
// import { ProjectCreate, ProjectGetAll } from '@shared/contracts';
// import { RMQService } from 'nestjs-rmq';
// import { JWTAuthGuard } from '../guards/jwt.guard';

// @Controller('project')
// export class ProjectController {
//   constructor(private readonly rmqService: RMQService) {}

//   @UseGuards(JWTAuthGuard)
//   @Post('create')
//   async createProject() {
//   }

//   @UseGuards(JWTAuthGuard)
//   @Get()
//   async getAllProjects() {}
//   }
// }
