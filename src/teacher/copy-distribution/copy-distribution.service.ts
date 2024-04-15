import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CopyBundle, CopyBundleDocument } from '../../schemas/sheet-bundle';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import { AddBundlesDto } from './dto/add-bundles.dto';
import { addDays, differenceInDays, format, isSunday } from 'date-fns';

@Injectable()
export class CopyDistributionService {
  constructor(
    @InjectModel(CopyBundle.name)
    private copyBundleModel: Model<CopyBundleDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  //#region Get Teacher Bundles
  async teacherBundles(teacherId: string) {
    function getNextWorkingDay(date) {
      const nextDay = addDays(date, 1);
      if (isSunday(nextDay)) {
        return getNextWorkingDay(nextDay);
      }
      return nextDay;
    }

    function getWorkingDateAfterDays(startDate, workingDays) {
      let currentDate = startDate;
      for (let i = 1; i < workingDays; i++) {
        currentDate = getNextWorkingDay(currentDate);
      }
      return currentDate;
    }

    const bundles = await this.copyBundleModel.find({
      evaluator: teacherId,
    });

    const res_obj = [];

    for (let i = 0; i < bundles.length; i++) {
      const bundle = bundles[i];
      const t = {
        _id: bundle._id,
        date_of_exam: bundle.date_of_exam,
        evaluation_mode: bundle.evaluation_mode,
        subject_code: bundle.subject_code,
        subject_name: bundle.subject_name,
        copies: [],
      };
      for (const c of bundle.copies) {
        const start_date = c.start_date;
        const due_date = start_date
          ? getWorkingDateAfterDays(new Date(start_date), 7)
          : null;
        const day_diff = differenceInDays(
          due_date,
          new Date(format(new Date(), 'yyyy-MM-dd')),
        );

        t.copies.push({
          _id: (c as any)._id,
          batch: c.batch,
          no_of_students: c.no_of_students,
          program: c.program,
          status:
            c.status == 'SUBMITTED'
              ? c.status
              : day_diff < 0
              ? 'OVERDUE'
              : c.status,
          allotted_date: c.allotted_date,
          start_date: c.start_date,
          // Due in days (7 working days from start date)
          due_in:
            start_date && c.status != 'SUBMITTED'
              ? day_diff > 0
                ? `Due in ${day_diff} days`
                : day_diff == 0
                ? 'Due Today'
                : `Overdue by ${Math.abs(day_diff)} days`
              : null,
        });
      }
      res_obj.push(t);
    }

    return {
      message: 'Bundles fetched successfully',
      data: res_obj,
    };
  }
}
