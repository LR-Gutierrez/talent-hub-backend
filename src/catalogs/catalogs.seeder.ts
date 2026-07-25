import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Gender } from './entities/gender.entity';
import { MaritalStatus } from './entities/marital-status.entity';
import { EducationLevel } from './entities/education-level.entity';
import { EmployeeDegree } from './entities/employee-degree.entity';
import { UniformSize } from './entities/uniform-size.entity';
import { Country } from './entities/country.entity';
import { BloodType } from './entities/blood-type.entity';

@Injectable()
export class CatalogsSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Gender) private readonly gendersRepo: Repository<Gender>,
    @InjectRepository(MaritalStatus) private readonly maritalStatusesRepo: Repository<MaritalStatus>,
    @InjectRepository(EducationLevel) private readonly educationLevelsRepo: Repository<EducationLevel>,
    @InjectRepository(EmployeeDegree) private readonly degreesRepo: Repository<EmployeeDegree>,
    @InjectRepository(Country) private readonly countriesRepo: Repository<Country>,
    @InjectRepository(UniformSize) private readonly uniformSizesRepo: Repository<UniformSize>,
    @InjectRepository(BloodType) private readonly bloodTypesRepo: Repository<BloodType>,
  ) {}

  async onModuleInit() {
    await this.seedGenders();
    await this.seedMaritalStatuses();
    await this.seedEducationLevels();
    await this.seedDegrees();
    await this.seedUniformSizes();
    await this.seedCountries();
    await this.seedBloodTypes();
  }

  private t = (es: string, fr: string, it: string) => ({ es, fr, it });

  private async seedWithTranslations<T extends { value?: string; name: string }>(
    repo: Repository<any>,
    items: (T & { translations: Record<string, string> })[],
  ) {
    const count = await repo.count();
    if (count === 0) {
      await repo.save(items);
      return;
    }
    const needUpdate = await repo.find({ where: { translations: IsNull() } });
    if (needUpdate.length === 0) return;
    const lookup = new Map(items.map((i) => [i.value || i.name, i.translations]));
    for (const record of needUpdate) {
      const tr = lookup.get(record.value || record.name);
      if (tr) {
        await repo.update(record.id, { translations: tr });
      }
    }
  }

  private async seedGenders() {
    const items = [
      { name: 'Male', value: 'male', sortOrder: 1, translations: this.t('Masculino', 'Homme', 'Maschio') },
      { name: 'Female', value: 'female', sortOrder: 2, translations: this.t('Femenino', 'Femme', 'Femmina') },
      { name: 'Other', value: 'other', sortOrder: 3, translations: this.t('Otro', 'Autre', 'Altro') },
    ];
    await this.seedWithTranslations(this.gendersRepo, items);
  }

  private async seedMaritalStatuses() {
    const items = [
      { name: 'Single', value: 'single', sortOrder: 1, translations: this.t('Soltero', 'Célibataire', 'Single') },
      { name: 'Married', value: 'married', sortOrder: 2, translations: this.t('Casado', 'Marié', 'Sposato') },
      { name: 'Divorced', value: 'divorced', sortOrder: 3, translations: this.t('Divorciado', 'Divorcé', 'Divorziato') },
      { name: 'Widowed', value: 'widowed', sortOrder: 4, translations: this.t('Viudo', 'Veuf', 'Vedovo') },
      { name: 'Other', value: 'other', sortOrder: 5, translations: this.t('Otro', 'Autre', 'Altro') },
    ];
    await this.seedWithTranslations(this.maritalStatusesRepo, items);
  }

  private async seedEducationLevels() {
    const items = [
      { name: 'High School', value: 'high_school', sortOrder: 1, translations: this.t('Secundaria', 'Lycée', 'Scuola superiore') },
      { name: 'Technical', value: 'technical', sortOrder: 2, translations: this.t('Técnico', 'Technique', 'Tecnico') },
      { name: 'Associate Degree', value: 'associate', sortOrder: 3, translations: this.t('Técnico Superior', 'Diplôme associé', 'Diploma associato') },
      { name: "Bachelor's", value: 'bachelor', sortOrder: 4, translations: this.t('Licenciatura', 'Licence', 'Laurea triennale') },
      { name: "Master's", value: 'master', sortOrder: 5, translations: this.t('Maestría', 'Master', 'Laurea magistrale') },
      { name: 'Doctorate', value: 'doctorate', sortOrder: 6, translations: this.t('Doctorado', 'Doctorat', 'Dottorato') },
      { name: 'Other', value: 'other', sortOrder: 7, translations: this.t('Otro', 'Autre', 'Altro') },
    ];
    await this.seedWithTranslations(this.educationLevelsRepo, items);
  }

  private async seedDegrees() {
    const items = [
      { value: 'accounting', name: 'Accounting', sortOrder: 1, translations: this.t('Contabilidad', 'Comptabilité', 'Contabilità') },
      { value: 'administration', name: 'Business Administration', sortOrder: 2, translations: this.t('Administración de Empresas', 'Administration des affaires', 'Amministrazione aziendale') },
      { value: 'agronomy', name: 'Agronomy', sortOrder: 3, translations: this.t('Agronomía', 'Agronomie', 'Agronomia') },
      { value: 'anthropology', name: 'Anthropology', sortOrder: 4, translations: this.t('Antropología', 'Anthropologie', 'Antropologia') },
      { value: 'architecture', name: 'Architecture', sortOrder: 5, translations: this.t('Arquitectura', 'Architecture', 'Architettura') },
      { value: 'art', name: 'Fine Arts', sortOrder: 6, translations: this.t('Bellas Artes', 'Beaux-arts', 'Belle Arti') },
      { value: 'biology', name: 'Biology', sortOrder: 7, translations: this.t('Biología', 'Biologie', 'Biologia') },
      { value: 'chemical_engineering', name: 'Chemical Engineering', sortOrder: 8, translations: this.t('Ingeniería Química', 'Génie chimique', 'Ingegneria chimica') },
      { value: 'chemistry', name: 'Chemistry', sortOrder: 9, translations: this.t('Química', 'Chimie', 'Chimica') },
      { value: 'civil_engineering', name: 'Civil Engineering', sortOrder: 10, translations: this.t('Ingeniería Civil', 'Génie civil', 'Ingegneria civile') },
      { value: 'communications', name: 'Communications', sortOrder: 11, translations: this.t('Comunicaciones', 'Communications', 'Comunicazioni') },
      { value: 'computer_science', name: 'Computer Science', sortOrder: 12, translations: this.t('Ciencias de la Computación', 'Informatique', 'Informatica') },
      { value: 'criminal_justice', name: 'Criminal Justice', sortOrder: 13, translations: this.t('Justicia Penal', 'Justice pénale', 'Giustizia penale') },
      { value: 'dentistry', name: 'Dentistry', sortOrder: 14, translations: this.t('Odontología', 'Dentisterie', 'Odontoiatria') },
      { value: 'design', name: 'Design', sortOrder: 15, translations: this.t('Diseño', 'Design', 'Design') },
      { value: 'economics', name: 'Economics', sortOrder: 16, translations: this.t('Economía', 'Économie', 'Economia') },
      { value: 'education', name: 'Education', sortOrder: 17, translations: this.t('Educación', 'Éducation', 'Educazione') },
      { value: 'electrical_engineering', name: 'Electrical Engineering', sortOrder: 18, translations: this.t('Ingeniería Eléctrica', 'Génie électrique', 'Ingegneria elettrica') },
      { value: 'environmental_science', name: 'Environmental Science', sortOrder: 19, translations: this.t('Ciencias Ambientales', 'Sciences de l\'environnement', 'Scienze ambientali') },
      { value: 'finance', name: 'Finance', sortOrder: 20, translations: this.t('Finanzas', 'Finance', 'Finanza') },
      { value: 'geography', name: 'Geography', sortOrder: 21, translations: this.t('Geografía', 'Géographie', 'Geografia') },
      { value: 'geology', name: 'Geology', sortOrder: 22, translations: this.t('Geología', 'Géologie', 'Geologia') },
      { value: 'graphic_design', name: 'Graphic Design', sortOrder: 23, translations: this.t('Diseño Gráfico', 'Design graphique', 'Graphic Design') },
      { value: 'history', name: 'History', sortOrder: 24, translations: this.t('Historia', 'Histoire', 'Storia') },
      { value: 'hospitality', name: 'Hospitality Management', sortOrder: 25, translations: this.t('Gestión Hotelera', 'Gestion hôtelière', 'Gestione alberghiera') },
      { value: 'industrial_engineering', name: 'Industrial Engineering', sortOrder: 26, translations: this.t('Ingeniería Industrial', 'Génie industriel', 'Ingegneria industriale') },
      { value: 'information_technology', name: 'Information Technology', sortOrder: 27, translations: this.t('Tecnología de la Información', 'Technologies de l\'information', 'Tecnologia dell\'informazione') },
      { value: 'journalism', name: 'Journalism', sortOrder: 28, translations: this.t('Periodismo', 'Journalisme', 'Giornalismo') },
      { value: 'law', name: 'Law', sortOrder: 29, translations: this.t('Derecho', 'Droit', 'Diritto') },
      { value: 'linguistics', name: 'Linguistics', sortOrder: 30, translations: this.t('Lingüística', 'Linguistique', 'Linguistica') },
      { value: 'marketing', name: 'Marketing', sortOrder: 31, translations: this.t('Mercadotecnia', 'Marketing', 'Marketing') },
      { value: 'mathematics', name: 'Mathematics', sortOrder: 32, translations: this.t('Matemáticas', 'Mathématiques', 'Matematica') },
      { value: 'mechanical_engineering', name: 'Mechanical Engineering', sortOrder: 33, translations: this.t('Ingeniería Mecánica', 'Génie mécanique', 'Ingegneria meccanica') },
      { value: 'medicine', name: 'Medicine', sortOrder: 34, translations: this.t('Medicina', 'Médecine', 'Medicina') },
      { value: 'music', name: 'Music', sortOrder: 35, translations: this.t('Música', 'Musique', 'Musica') },
      { value: 'nursing', name: 'Nursing', sortOrder: 36, translations: this.t('Enfermería', 'Soins infirmiers', 'Infermieristica') },
      { value: 'nutrition', name: 'Nutrition', sortOrder: 37, translations: this.t('Nutrición', 'Nutrition', 'Nutrizione') },
      { value: 'pharmacy', name: 'Pharmacy', sortOrder: 38, translations: this.t('Farmacia', 'Pharmacie', 'Farmacia') },
      { value: 'philosophy', name: 'Philosophy', sortOrder: 39, translations: this.t('Filosofía', 'Philosophie', 'Filosofia') },
      { value: 'physical_therapy', name: 'Physical Therapy', sortOrder: 40, translations: this.t('Fisioterapia', 'Physiothérapie', 'Fisioterapia') },
      { value: 'physics', name: 'Physics', sortOrder: 41, translations: this.t('Física', 'Physique', 'Fisica') },
      { value: 'political_science', name: 'Political Science', sortOrder: 42, translations: this.t('Ciencias Políticas', 'Sciences politiques', 'Scienze politiche') },
      { value: 'psychology', name: 'Psychology', sortOrder: 43, translations: this.t('Psicología', 'Psychologie', 'Psicologia') },
      { value: 'public_relations', name: 'Public Relations', sortOrder: 44, translations: this.t('Relaciones Públicas', 'Relations publiques', 'Relazioni pubbliche') },
      { value: 'social_work', name: 'Social Work', sortOrder: 45, translations: this.t('Trabajo Social', 'Travail social', 'Servizio sociale') },
      { value: 'sociology', name: 'Sociology', sortOrder: 46, translations: this.t('Sociología', 'Sociologie', 'Sociologia') },
      { value: 'software_engineering', name: 'Software Engineering', sortOrder: 47, translations: this.t('Ingeniería de Software', 'Génie logiciel', 'Ingegneria del software') },
      { value: 'systems_engineering', name: 'Systems Engineering', sortOrder: 48, translations: this.t('Ingeniería de Sistemas', 'Génie des systèmes', 'Ingegneria dei sistemi') },
      { value: 'veterinary', name: 'Veterinary Medicine', sortOrder: 49, translations: this.t('Medicina Veterinaria', 'Médecine vétérinaire', 'Medicina veterinaria') },
    ];
    await this.seedWithTranslations(this.degreesRepo, items);
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
      { value: 'AF', name: 'Afghanistan', dialCode: '+93', sortOrder: 1, translations: this.t('Afganistán', 'Afghanistan', 'Afghanistan') },
      { value: 'AL', name: 'Albania', dialCode: '+355', sortOrder: 2, translations: this.t('Albania', 'Albanie', 'Albania') },
      { value: 'DZ', name: 'Algeria', dialCode: '+213', sortOrder: 3, translations: this.t('Argelia', 'Algérie', 'Algeria') },
      { value: 'AR', name: 'Argentina', dialCode: '+54', sortOrder: 4, translations: this.t('Argentina', 'Argentine', 'Argentina') },
      { value: 'AU', name: 'Australia', dialCode: '+61', sortOrder: 5, translations: this.t('Australia', 'Australie', 'Australia') },
      { value: 'AT', name: 'Austria', dialCode: '+43', sortOrder: 6, translations: this.t('Austria', 'Autriche', 'Austria') },
      { value: 'BE', name: 'Belgium', dialCode: '+32', sortOrder: 7, translations: this.t('Bélgica', 'Belgique', 'Belgio') },
      { value: 'BO', name: 'Bolivia', dialCode: '+591', sortOrder: 8, translations: this.t('Bolivia', 'Bolivie', 'Bolivia') },
      { value: 'BR', name: 'Brazil', dialCode: '+55', sortOrder: 9, translations: this.t('Brasil', 'Brésil', 'Brasile') },
      { value: 'CA', name: 'Canada', dialCode: '+1', sortOrder: 10, translations: this.t('Canadá', 'Canada', 'Canada') },
      { value: 'CL', name: 'Chile', dialCode: '+56', sortOrder: 11, translations: this.t('Chile', 'Chili', 'Cile') },
      { value: 'CN', name: 'China', dialCode: '+86', sortOrder: 12, translations: this.t('China', 'Chine', 'Cina') },
      { value: 'CO', name: 'Colombia', dialCode: '+57', sortOrder: 13, translations: this.t('Colombia', 'Colombie', 'Colombia') },
      { value: 'CR', name: 'Costa Rica', dialCode: '+506', sortOrder: 14, translations: this.t('Costa Rica', 'Costa Rica', 'Costa Rica') },
      { value: 'HR', name: 'Croatia', dialCode: '+385', sortOrder: 15, translations: this.t('Croacia', 'Croatie', 'Croazia') },
      { value: 'CU', name: 'Cuba', dialCode: '+53', sortOrder: 16, translations: this.t('Cuba', 'Cuba', 'Cuba') },
      { value: 'CZ', name: 'Czech Republic', dialCode: '+420', sortOrder: 17, translations: this.t('República Checa', 'République tchèque', 'Repubblica Ceca') },
      { value: 'DK', name: 'Denmark', dialCode: '+45', sortOrder: 18, translations: this.t('Dinamarca', 'Danemark', 'Danimarca') },
      { value: 'DO', name: 'Dominican Republic', dialCode: '+1849', sortOrder: 19, translations: this.t('República Dominicana', 'République dominicaine', 'Repubblica Dominicana') },
      { value: 'EC', name: 'Ecuador', dialCode: '+593', sortOrder: 20, translations: this.t('Ecuador', 'Équateur', 'Ecuador') },
      { value: 'EG', name: 'Egypt', dialCode: '+20', sortOrder: 21, translations: this.t('Egipto', 'Égypte', 'Egitto') },
      { value: 'SV', name: 'El Salvador', dialCode: '+503', sortOrder: 22, translations: this.t('El Salvador', 'El Salvador', 'El Salvador') },
      { value: 'FI', name: 'Finland', dialCode: '+358', sortOrder: 23, translations: this.t('Finlandia', 'Finlande', 'Finlandia') },
      { value: 'FR', name: 'France', dialCode: '+33', sortOrder: 24, translations: this.t('Francia', 'France', 'Francia') },
      { value: 'DE', name: 'Germany', dialCode: '+49', sortOrder: 25, translations: this.t('Alemania', 'Allemagne', 'Germania') },
      { value: 'GR', name: 'Greece', dialCode: '+30', sortOrder: 26, translations: this.t('Grecia', 'Grèce', 'Grecia') },
      { value: 'GT', name: 'Guatemala', dialCode: '+502', sortOrder: 27, translations: this.t('Guatemala', 'Guatemala', 'Guatemala') },
      { value: 'HN', name: 'Honduras', dialCode: '+504', sortOrder: 28, translations: this.t('Honduras', 'Honduras', 'Honduras') },
      { value: 'HK', name: 'Hong Kong', dialCode: '+852', sortOrder: 29, translations: this.t('Hong Kong', 'Hong Kong', 'Hong Kong') },
      { value: 'IN', name: 'India', dialCode: '+91', sortOrder: 30, translations: this.t('India', 'Inde', 'India') },
      { value: 'ID', name: 'Indonesia', dialCode: '+62', sortOrder: 31, translations: this.t('Indonesia', 'Indonésie', 'Indonesia') },
      { value: 'IE', name: 'Ireland', dialCode: '+353', sortOrder: 32, translations: this.t('Irlanda', 'Irlande', 'Irlanda') },
      { value: 'IL', name: 'Israel', dialCode: '+972', sortOrder: 33, translations: this.t('Israel', 'Israël', 'Israele') },
      { value: 'IT', name: 'Italy', dialCode: '+39', sortOrder: 34, translations: this.t('Italia', 'Italie', 'Italia') },
      { value: 'JP', name: 'Japan', dialCode: '+81', sortOrder: 35, translations: this.t('Japón', 'Japon', 'Giappone') },
      { value: 'KR', name: 'South Korea', dialCode: '+82', sortOrder: 36, translations: this.t('Corea del Sur', 'Corée du Sud', 'Corea del Sud') },
      { value: 'MX', name: 'Mexico', dialCode: '+52', sortOrder: 37, translations: this.t('México', 'Mexique', 'Messico') },
      { value: 'NL', name: 'Netherlands', dialCode: '+31', sortOrder: 38, translations: this.t('Países Bajos', 'Pays-Bas', 'Paesi Bassi') },
      { value: 'NZ', name: 'New Zealand', dialCode: '+64', sortOrder: 39, translations: this.t('Nueva Zelanda', 'Nouvelle-Zélande', 'Nuova Zelanda') },
      { value: 'NI', name: 'Nicaragua', dialCode: '+505', sortOrder: 40, translations: this.t('Nicaragua', 'Nicaragua', 'Nicaragua') },
      { value: 'PA', name: 'Panama', dialCode: '+507', sortOrder: 41, translations: this.t('Panamá', 'Panama', 'Panamá') },
      { value: 'PY', name: 'Paraguay', dialCode: '+595', sortOrder: 42, translations: this.t('Paraguay', 'Paraguay', 'Paraguay') },
      { value: 'PE', name: 'Peru', dialCode: '+51', sortOrder: 43, translations: this.t('Perú', 'Pérou', 'Perù') },
      { value: 'PH', name: 'Philippines', dialCode: '+63', sortOrder: 44, translations: this.t('Filipinas', 'Philippines', 'Filippine') },
      { value: 'PL', name: 'Poland', dialCode: '+48', sortOrder: 45, translations: this.t('Polonia', 'Pologne', 'Polonia') },
      { value: 'PT', name: 'Portugal', dialCode: '+351', sortOrder: 46, translations: this.t('Portugal', 'Portugal', 'Portogallo') },
      { value: 'PR', name: 'Puerto Rico', dialCode: '+1939', sortOrder: 47, translations: this.t('Puerto Rico', 'Porto Rico', 'Porto Rico') },
      { value: 'RU', name: 'Russia', dialCode: '+7', sortOrder: 48, translations: this.t('Rusia', 'Russie', 'Russia') },
      { value: 'SA', name: 'Saudi Arabia', dialCode: '+966', sortOrder: 49, translations: this.t('Arabia Saudita', 'Arabie saoudite', 'Arabia Saudita') },
      { value: 'SG', name: 'Singapore', dialCode: '+65', sortOrder: 50, translations: this.t('Singapur', 'Singapour', 'Singapore') },
      { value: 'ZA', name: 'South Africa', dialCode: '+27', sortOrder: 51, translations: this.t('Sudáfrica', 'Afrique du Sud', 'Sudafrica') },
      { value: 'ES', name: 'Spain', dialCode: '+34', sortOrder: 52, translations: this.t('España', 'Espagne', 'Spagna') },
      { value: 'SE', name: 'Sweden', dialCode: '+46', sortOrder: 53, translations: this.t('Suecia', 'Suède', 'Svezia') },
      { value: 'CH', name: 'Switzerland', dialCode: '+41', sortOrder: 54, translations: this.t('Suiza', 'Suisse', 'Svizzera') },
      { value: 'TW', name: 'Taiwan', dialCode: '+886', sortOrder: 55, translations: this.t('Taiwán', 'Taïwan', 'Taiwan') },
      { value: 'TH', name: 'Thailand', dialCode: '+66', sortOrder: 56, translations: this.t('Tailandia', 'Thaïlande', 'Thailandia') },
      { value: 'TR', name: 'Turkey', dialCode: '+90', sortOrder: 57, translations: this.t('Turquía', 'Turquie', 'Turchia') },
      { value: 'UA', name: 'Ukraine', dialCode: '+380', sortOrder: 58, translations: this.t('Ucrania', 'Ukraine', 'Ucraina') },
      { value: 'GB', name: 'United Kingdom', dialCode: '+44', sortOrder: 59, translations: this.t('Reino Unido', 'Royaume-Uni', 'Regno Unito') },
      { value: 'US', name: 'United States', dialCode: '+1', sortOrder: 60, translations: this.t('Estados Unidos', 'États-Unis', 'Stati Uniti') },
      { value: 'UY', name: 'Uruguay', dialCode: '+598', sortOrder: 61, translations: this.t('Uruguay', 'Uruguay', 'Uruguay') },
      { value: 'VE', name: 'Venezuela', dialCode: '+58', sortOrder: 62, translations: this.t('Venezuela', 'Venezuela', 'Venezuela') },
      { value: 'VN', name: 'Vietnam', dialCode: '+84', sortOrder: 63, translations: this.t('Vietnam', 'Viêt Nam', 'Vietnam') },
    ];
    await this.seedWithTranslations(this.countriesRepo, items);
  }

  private async seedBloodTypes() {
    const items = [
      { name: 'A+', value: 'A+', sortOrder: 1, translations: this.t('A+', 'A+', 'A+') },
      { name: 'A-', value: 'A-', sortOrder: 2, translations: this.t('A-', 'A-', 'A-') },
      { name: 'B+', value: 'B+', sortOrder: 3, translations: this.t('B+', 'B+', 'B+') },
      { name: 'B-', value: 'B-', sortOrder: 4, translations: this.t('B-', 'B-', 'B-') },
      { name: 'AB+', value: 'AB+', sortOrder: 5, translations: this.t('AB+', 'AB+', 'AB+') },
      { name: 'AB-', value: 'AB-', sortOrder: 6, translations: this.t('AB-', 'AB-', 'AB-') },
      { name: 'O+', value: 'O+', sortOrder: 7, translations: this.t('O+', 'O+', 'O+') },
      { name: 'O-', value: 'O-', sortOrder: 8, translations: this.t('O-', 'O-', 'O-') },
    ];
    await this.seedWithTranslations(this.bloodTypesRepo, items);
  }
}
