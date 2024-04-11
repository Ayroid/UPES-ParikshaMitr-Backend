import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CopyBundle, CopyBundleDocument } from '../../schemas/sheet-bundle';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import { AddBundlesDto } from './dto/add-bundles.dto';
import { format } from 'date-fns';

@Injectable()
export class CopyDistributionService {
  constructor(
    @InjectModel(CopyBundle.name)
    private copyBundleModel: Model<CopyBundleDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  //#region Add New Bundles
  async addBundles(addBundledto: AddBundlesDto) {
    const teacher = await this.teacherModel.findOne({
      sap_id: addBundledto.evaluatorSap,
    });
    if (!teacher) {
      return {
        message: 'Teacher not found',
      };
    }

    const regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

    // Test the date string against the regular expression.
    if (!regex.test(addBundledto.dateOfExam)) {
      // The date string is in the dd/mm/yyyy format.
      throw new HttpException(
        'Invalid date format for bundle ' +
          addBundledto.dateOfExam +
          '. Please use dd/mm/yyyy format.',
        400,
      );
    }

    // Split the date string into an array using the "/" character as the delimiter.
    const dateArray = addBundledto.dateOfExam.split('/');

    // Convert the first element of the array to a number using the parseInt() function. This is the day of the month.
    const day = parseInt(dateArray[0]);

    // Convert the second element of the array to a number using the parseInt() function. This is the month.
    const month = parseInt(dateArray[1]);

    // Convert the third element of the array to a number using the parseInt() function. This is the year.
    const year = parseInt(dateArray[2]);

    // Create a new Date object using the day, month, and year values.
    const date = new Date(year, month - 1, day);

    const exam_date = format(date, 'yyyy-MM-dd');

    const prev_bundle = await this.copyBundleModel.findOne({
      date_of_exam: exam_date,
      subject_code: addBundledto.subjectCode,
      evaluator: teacher._id,
    });

    if (prev_bundle) {
      if (
        prev_bundle.copies.some(
          (copy) =>
            copy.batch === addBundledto.batch &&
            copy.program === addBundledto.program,
        )
      ) {
        throw new HttpException('CopyBundle already exists', 400);
      }

      const copy = {
        batch: addBundledto.batch,
        no_of_students: parseInt(addBundledto.noOfStudents),
        program: addBundledto.program,
      };
      prev_bundle.copies.push({
        ...copy,
      });
      prev_bundle.save();
    } else {
      const copyBundle = new this.copyBundleModel({
        date_of_exam: exam_date,
        evaluation_mode: addBundledto.evaluationMode,
        evaluator: teacher._id,
        subject_code: addBundledto.subjectCode,
        subject_name: addBundledto.subjectName,
        copies: [
          {
            batch: addBundledto.batch,
            no_of_students: addBundledto.noOfStudents,
            program: addBundledto.program,
          },
        ],
      });
      copyBundle.save();
    }

    return {
      message: 'CopyBundle added successfully',
    };
  }

  //#region Get All Bundles
  async allBundles() {
    const bundles = await this.copyBundleModel.find().populate('evaluator');
    return bundles;
  }
}
