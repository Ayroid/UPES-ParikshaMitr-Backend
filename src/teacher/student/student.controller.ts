import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { TeacherJwtGuard } from 'src/guards/teacher-jwt.guard';

@Controller('teacher/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @UseGuards(TeacherJwtGuard)
  @Get('search-sheet')
  searchStudent(@Query('ans_sheet_number') ans_sheet_number: string) {
    return this.studentService.searchStudent(ans_sheet_number);
  }
  @UseGuards(TeacherJwtGuard)
  @Get('att-search-sap')
  getStudentAttendanceBySapId(@Query('sap_id') sap_id: string) {
    return this.studentService.getStudentAttendanceBySapId(sap_id);
  }
}
