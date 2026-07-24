import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from './entities/gender.entity';
import { MaritalStatus } from './entities/marital-status.entity';
import { EducationLevel } from './entities/education-level.entity';
import { EmployeeDegree } from './entities/employee-degree.entity';
import { UniformSize } from './entities/uniform-size.entity';
import { Country } from './entities/country.entity';

@Injectable()
export class CatalogsSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Gender) private readonly gendersRepo: Repository<Gender>,
    @InjectRepository(MaritalStatus) private readonly maritalStatusesRepo: Repository<MaritalStatus>,
    @InjectRepository(EducationLevel) private readonly educationLevelsRepo: Repository<EducationLevel>,
    @InjectRepository(EmployeeDegree) private readonly degreesRepo: Repository<EmployeeDegree>,
    @InjectRepository(Country) private readonly countriesRepo: Repository<Country>,
    @InjectRepository(UniformSize) private readonly uniformSizesRepo: Repository<UniformSize>,
  ) {}

  async onModuleInit() {
    await this.seedGenders();
    await this.seedMaritalStatuses();
    await this.seedEducationLevels();
    await this.seedDegrees();
    await this.seedUniformSizes();
    await this.seedCountries();
  }

  private async seedGenders() {
    const count = await this.gendersRepo.count();
    if (count > 0) return;
    const items = [
      { name: 'Male', value: 'male', sortOrder: 1 },
      { name: 'Female', value: 'female', sortOrder: 2 },
      { name: 'Other', value: 'other', sortOrder: 3 },
    ];
    await this.gendersRepo.save(items);
  }

  private async seedMaritalStatuses() {
    const count = await this.maritalStatusesRepo.count();
    if (count > 0) return;
    const items = [
      { name: 'Single', value: 'single', sortOrder: 1 },
      { name: 'Married', value: 'married', sortOrder: 2 },
      { name: 'Divorced', value: 'divorced', sortOrder: 3 },
      { name: 'Widowed', value: 'widowed', sortOrder: 4 },
      { name: 'Other', value: 'other', sortOrder: 5 },
    ];
    await this.maritalStatusesRepo.save(items);
  }

  private async seedEducationLevels() {
    const count = await this.educationLevelsRepo.count();
    if (count > 0) return;
    const items = [
      { name: 'High School', value: 'high_school', sortOrder: 1 },
      { name: 'Technical', value: 'technical', sortOrder: 2 },
      { name: 'Associate Degree', value: 'associate', sortOrder: 3 },
      { name: "Bachelor's", value: 'bachelor', sortOrder: 4 },
      { name: "Master's", value: 'master', sortOrder: 5 },
      { name: 'Doctorate', value: 'doctorate', sortOrder: 6 },
      { name: 'Other', value: 'other', sortOrder: 7 },
    ];
    await this.educationLevelsRepo.save(items);
  }

  private async seedDegrees() {
    const count = await this.degreesRepo.count();
    if (count > 0) return;
    const items = [
      { value: 'accounting', name: 'Accounting', sortOrder: 1 },
      { value: 'administration', name: 'Business Administration', sortOrder: 2 },
      { value: 'agronomy', name: 'Agronomy', sortOrder: 3 },
      { value: 'anthropology', name: 'Anthropology', sortOrder: 4 },
      { value: 'architecture', name: 'Architecture', sortOrder: 5 },
      { value: 'art', name: 'Fine Arts', sortOrder: 6 },
      { value: 'biology', name: 'Biology', sortOrder: 7 },
      { value: 'chemical_engineering', name: 'Chemical Engineering', sortOrder: 8 },
      { value: 'chemistry', name: 'Chemistry', sortOrder: 9 },
      { value: 'civil_engineering', name: 'Civil Engineering', sortOrder: 10 },
      { value: 'communications', name: 'Communications', sortOrder: 11 },
      { value: 'computer_science', name: 'Computer Science', sortOrder: 12 },
      { value: 'criminal_justice', name: 'Criminal Justice', sortOrder: 13 },
      { value: 'dentistry', name: 'Dentistry', sortOrder: 14 },
      { value: 'design', name: 'Design', sortOrder: 15 },
      { value: 'economics', name: 'Economics', sortOrder: 16 },
      { value: 'education', name: 'Education', sortOrder: 17 },
      { value: 'electrical_engineering', name: 'Electrical Engineering', sortOrder: 18 },
      { value: 'environmental_science', name: 'Environmental Science', sortOrder: 19 },
      { value: 'finance', name: 'Finance', sortOrder: 20 },
      { value: 'geography', name: 'Geography', sortOrder: 21 },
      { value: 'geology', name: 'Geology', sortOrder: 22 },
      { value: 'graphic_design', name: 'Graphic Design', sortOrder: 23 },
      { value: 'history', name: 'History', sortOrder: 24 },
      { value: 'hospitality', name: 'Hospitality Management', sortOrder: 25 },
      { value: 'industrial_engineering', name: 'Industrial Engineering', sortOrder: 26 },
      { value: 'information_technology', name: 'Information Technology', sortOrder: 27 },
      { value: 'journalism', name: 'Journalism', sortOrder: 28 },
      { value: 'law', name: 'Law', sortOrder: 29 },
      { value: 'linguistics', name: 'Linguistics', sortOrder: 30 },
      { value: 'marketing', name: 'Marketing', sortOrder: 31 },
      { value: 'mathematics', name: 'Mathematics', sortOrder: 32 },
      { value: 'mechanical_engineering', name: 'Mechanical Engineering', sortOrder: 33 },
      { value: 'medicine', name: 'Medicine', sortOrder: 34 },
      { value: 'music', name: 'Music', sortOrder: 35 },
      { value: 'nursing', name: 'Nursing', sortOrder: 36 },
      { value: 'nutrition', name: 'Nutrition', sortOrder: 37 },
      { value: 'pharmacy', name: 'Pharmacy', sortOrder: 38 },
      { value: 'philosophy', name: 'Philosophy', sortOrder: 39 },
      { value: 'physical_therapy', name: 'Physical Therapy', sortOrder: 40 },
      { value: 'physics', name: 'Physics', sortOrder: 41 },
      { value: 'political_science', name: 'Political Science', sortOrder: 42 },
      { value: 'psychology', name: 'Psychology', sortOrder: 43 },
      { value: 'public_relations', name: 'Public Relations', sortOrder: 44 },
      { value: 'social_work', name: 'Social Work', sortOrder: 45 },
      { value: 'sociology', name: 'Sociology', sortOrder: 46 },
      { value: 'software_engineering', name: 'Software Engineering', sortOrder: 47 },
      { value: 'systems_engineering', name: 'Systems Engineering', sortOrder: 48 },
      { value: 'veterinary', name: 'Veterinary Medicine', sortOrder: 49 },
    ];
    await this.degreesRepo.save(items);
  }

  private async seedUniformSizes() {
    const count = await this.uniformSizesRepo.count();
    if (count > 0) return;
    const clothing = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s, i) => ({
      name: s, value: s, category: 'clothing', sortOrder: i + 1,
    }));
    const shoes = Array.from({ length: 15 }, (_, i) => ({
      name: String(35 + i), value: String(35 + i), category: 'shoe', sortOrder: i + 1,
    }));
    const helmets = [
      { name: '52-54 cm', value: '52-54', category: 'helmet', sortOrder: 1 },
      { name: '54-56 cm', value: '54-56', category: 'helmet', sortOrder: 2 },
      { name: '56-58 cm', value: '56-58', category: 'helmet', sortOrder: 3 },
      { name: '58-60 cm', value: '58-60', category: 'helmet', sortOrder: 4 },
      { name: '60-62 cm', value: '60-62', category: 'helmet', sortOrder: 5 },
      { name: '62-64 cm', value: '62-64', category: 'helmet', sortOrder: 6 },
    ];
    await this.uniformSizesRepo.save([...clothing, ...shoes, ...helmets]);
  }

  private async seedCountries() {
    const count = await this.countriesRepo.count();
    if (count > 0) return;
    const items = [
      { value: 'AF', name: 'Afghanistan', dialCode: '+93', sortOrder: 1 },
      { value: 'AL', name: 'Albania', dialCode: '+355', sortOrder: 2 },
      { value: 'DZ', name: 'Algeria', dialCode: '+213', sortOrder: 3 },
      { value: 'AR', name: 'Argentina', dialCode: '+54', sortOrder: 4 },
      { value: 'AU', name: 'Australia', dialCode: '+61', sortOrder: 5 },
      { value: 'AT', name: 'Austria', dialCode: '+43', sortOrder: 6 },
      { value: 'BE', name: 'Belgium', dialCode: '+32', sortOrder: 7 },
      { value: 'BO', name: 'Bolivia', dialCode: '+591', sortOrder: 8 },
      { value: 'BR', name: 'Brazil', dialCode: '+55', sortOrder: 9 },
      { value: 'CA', name: 'Canada', dialCode: '+1', sortOrder: 10 },
      { value: 'CL', name: 'Chile', dialCode: '+56', sortOrder: 11 },
      { value: 'CN', name: 'China', dialCode: '+86', sortOrder: 12 },
      { value: 'CO', name: 'Colombia', dialCode: '+57', sortOrder: 13 },
      { value: 'CR', name: 'Costa Rica', dialCode: '+506', sortOrder: 14 },
      { value: 'HR', name: 'Croatia', dialCode: '+385', sortOrder: 15 },
      { value: 'CU', name: 'Cuba', dialCode: '+53', sortOrder: 16 },
      { value: 'CZ', name: 'Czech Republic', dialCode: '+420', sortOrder: 17 },
      { value: 'DK', name: 'Denmark', dialCode: '+45', sortOrder: 18 },
      { value: 'DO', name: 'Dominican Republic', dialCode: '+1849', sortOrder: 19 },
      { value: 'EC', name: 'Ecuador', dialCode: '+593', sortOrder: 20 },
      { value: 'EG', name: 'Egypt', dialCode: '+20', sortOrder: 21 },
      { value: 'SV', name: 'El Salvador', dialCode: '+503', sortOrder: 22 },
      { value: 'FI', name: 'Finland', dialCode: '+358', sortOrder: 23 },
      { value: 'FR', name: 'France', dialCode: '+33', sortOrder: 24 },
      { value: 'DE', name: 'Germany', dialCode: '+49', sortOrder: 25 },
      { value: 'GR', name: 'Greece', dialCode: '+30', sortOrder: 26 },
      { value: 'GT', name: 'Guatemala', dialCode: '+502', sortOrder: 27 },
      { value: 'HN', name: 'Honduras', dialCode: '+504', sortOrder: 28 },
      { value: 'HK', name: 'Hong Kong', dialCode: '+852', sortOrder: 29 },
      { value: 'IN', name: 'India', dialCode: '+91', sortOrder: 30 },
      { value: 'ID', name: 'Indonesia', dialCode: '+62', sortOrder: 31 },
      { value: 'IE', name: 'Ireland', dialCode: '+353', sortOrder: 32 },
      { value: 'IL', name: 'Israel', dialCode: '+972', sortOrder: 33 },
      { value: 'IT', name: 'Italy', dialCode: '+39', sortOrder: 34 },
      { value: 'JP', name: 'Japan', dialCode: '+81', sortOrder: 35 },
      { value: 'KR', name: 'South Korea', dialCode: '+82', sortOrder: 36 },
      { value: 'MX', name: 'Mexico', dialCode: '+52', sortOrder: 37 },
      { value: 'NL', name: 'Netherlands', dialCode: '+31', sortOrder: 38 },
      { value: 'NZ', name: 'New Zealand', dialCode: '+64', sortOrder: 39 },
      { value: 'NI', name: 'Nicaragua', dialCode: '+505', sortOrder: 40 },
      { value: 'PA', name: 'Panama', dialCode: '+507', sortOrder: 41 },
      { value: 'PY', name: 'Paraguay', dialCode: '+595', sortOrder: 42 },
      { value: 'PE', name: 'Peru', dialCode: '+51', sortOrder: 43 },
      { value: 'PH', name: 'Philippines', dialCode: '+63', sortOrder: 44 },
      { value: 'PL', name: 'Poland', dialCode: '+48', sortOrder: 45 },
      { value: 'PT', name: 'Portugal', dialCode: '+351', sortOrder: 46 },
      { value: 'PR', name: 'Puerto Rico', dialCode: '+1939', sortOrder: 47 },
      { value: 'RU', name: 'Russia', dialCode: '+7', sortOrder: 48 },
      { value: 'SA', name: 'Saudi Arabia', dialCode: '+966', sortOrder: 49 },
      { value: 'SG', name: 'Singapore', dialCode: '+65', sortOrder: 50 },
      { value: 'ZA', name: 'South Africa', dialCode: '+27', sortOrder: 51 },
      { value: 'ES', name: 'Spain', dialCode: '+34', sortOrder: 52 },
      { value: 'SE', name: 'Sweden', dialCode: '+46', sortOrder: 53 },
      { value: 'CH', name: 'Switzerland', dialCode: '+41', sortOrder: 54 },
      { value: 'TW', name: 'Taiwan', dialCode: '+886', sortOrder: 55 },
      { value: 'TH', name: 'Thailand', dialCode: '+66', sortOrder: 56 },
      { value: 'TR', name: 'Turkey', dialCode: '+90', sortOrder: 57 },
      { value: 'UA', name: 'Ukraine', dialCode: '+380', sortOrder: 58 },
      { value: 'GB', name: 'United Kingdom', dialCode: '+44', sortOrder: 59 },
      { value: 'US', name: 'United States', dialCode: '+1', sortOrder: 60 },
      { value: 'UY', name: 'Uruguay', dialCode: '+598', sortOrder: 61 },
      { value: 'VE', name: 'Venezuela', dialCode: '+58', sortOrder: 62 },
      { value: 'VN', name: 'Vietnam', dialCode: '+84', sortOrder: 63 },
    ];
    await this.countriesRepo.save(items);
  }
}
