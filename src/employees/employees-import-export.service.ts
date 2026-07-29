import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeEducation } from './entities/employee-education.entity';
import { EmployeeUniform } from './entities/employee-uniform.entity';
import { EmployeeChild } from './entities/employee-child.entity';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { Department } from '../departments/entities/department.entity';
import { Gender } from '../catalogs/entities/gender.entity';
import { Country } from '../catalogs/entities/country.entity';
import { MaritalStatus } from '../catalogs/entities/marital-status.entity';
import { BloodType } from '../catalogs/entities/blood-type.entity';

interface ColumnGroup {
  label: string;
  color: string;
  columns: { header: string; key: string; width: number }[];
}

const GROUPS: ColumnGroup[] = [
  {
    label: 'Personal Info',
    color: 'FF2563EB',
    columns: [
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Phone Extension', key: 'phoneExtension', width: 15 },
      { header: 'Corporate Phone', key: 'corporatePhone', width: 18 },
      { header: 'Satellite Phone', key: 'satellitePhone', width: 18 },
      { header: 'Room Phone', key: 'roomPhone', width: 15 },
      { header: 'Mobile Phone', key: 'mobilePhone', width: 18 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Birth Date', key: 'birthDate', width: 15 },
      { header: 'Document ID', key: 'documentId', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Nationality', key: 'nationality', width: 20 },
      { header: 'Marital Status', key: 'maritalStatus', width: 18 },
      { header: 'Place of Birth', key: 'placeOfBirth', width: 20 },
      { header: 'Blood Type', key: 'bloodType', width: 12 },
      { header: 'Notes', key: 'notes', width: 40 },
    ],
  },
  {
    label: 'Labor Info',
    color: 'FF059669',
    columns: [
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Position', key: 'position', width: 25 },
      { header: 'Contracting Company', key: 'contractingCompany', width: 25 },
      { header: 'Hire Date', key: 'hireDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Salary', key: 'salary', width: 15 },
      { header: 'Supervisor', key: 'supervisor', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Is Active', key: 'isActive', width: 12 },
    ],
  },
  {
    label: 'Education',
    color: 'FF7C3AED',
    columns: [
      { header: 'Education Level', key: 'educationLevel', width: 20 },
      { header: 'Degree', key: 'degree', width: 25 },
      { header: 'Institution', key: 'institution', width: 30 },
      { header: 'Graduation Year', key: 'graduationYear', width: 15 },
    ],
  },
  {
    label: 'Uniform',
    color: 'FFF59E0B',
    columns: [
      { header: 'Shirt Size', key: 'shirtSize', width: 12 },
      { header: 'Pant Size', key: 'pantSize', width: 12 },
      { header: 'Shoe Size', key: 'shoeSize', width: 12 },
      { header: 'Jacket Size', key: 'jacketSize', width: 12 },
      { header: 'Helmet Size', key: 'helmetSize', width: 12 },
    ],
  },
  {
    label: 'Children',
    color: 'FFDC2626',
    columns: [
      { header: 'Child 1 Name', key: 'child1Name', width: 25 },
      { header: 'Child 1 Birth Date', key: 'child1BirthDate', width: 18 },
      { header: 'Child 1 Gender', key: 'child1Gender', width: 15 },
      { header: 'Child 2 Name', key: 'child2Name', width: 25 },
      { header: 'Child 2 Birth Date', key: 'child2BirthDate', width: 18 },
      { header: 'Child 2 Gender', key: 'child2Gender', width: 15 },
    ],
  },
  {
    label: 'Emergency Contacts',
    color: 'FF0891B2',
    columns: [
      {
        header: 'Emergency Contact Name',
        key: 'emergencyContactName',
        width: 25,
      },
      {
        header: 'Emergency Contact Phone',
        key: 'emergencyContactPhone',
        width: 20,
      },
      {
        header: 'Emergency Contact Relationship',
        key: 'emergencyContactRelationship',
        width: 25,
      },
    ],
  },
];

const ALL_COLUMNS = GROUPS.flatMap((g) => g.columns);

const EXCLUDED_LABELS = new Set([
  'Education',
  'Children',
  'Emergency Contacts',
]);
const MAIN_GROUPS = GROUPS.filter((g) => !EXCLUDED_LABELS.has(g.label));
const MAIN_COLUMNS = MAIN_GROUPS.flatMap((g) => g.columns);

const EDUCATION_COLUMNS = [
  { header: 'Employee Name', key: 'employeeName', width: 30 },
  { header: 'Education Level', key: 'educationLevel', width: 20 },
  { header: 'Degree', key: 'degree', width: 25 },
  { header: 'Institution', key: 'institution', width: 30 },
  { header: 'Graduation Year', key: 'graduationYear', width: 18 },
];

const CHILD_COLUMNS = [
  { header: 'Employee Name', key: 'employeeName', width: 30 },
  { header: 'Child Name', key: 'childName', width: 25 },
  { header: 'Birth Date', key: 'birthDate', width: 18 },
  { header: 'Gender', key: 'gender', width: 15 },
];

const CONTACT_COLUMNS = [
  { header: 'Employee Name', key: 'employeeName', width: 30 },
  { header: 'Contact Name', key: 'contactName', width: 25 },
  { header: 'Phone', key: 'phone', width: 20 },
  { header: 'Relationship', key: 'relationship', width: 25 },
];

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

function styleHeaderRow(row: ExcelJS.Row, columnCount: number) {
  row.height = 22;
  for (let c = 1; c <= columnCount; c++) {
    const cell = row.getCell(c);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = THIN_BORDER;
  }
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'object' && 'text' in value) {
    return String((value as { text: string }).text ?? '');
  }
  return '';
}

function normalizeFullName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function normalizeBloodType(raw: string): string {
  const s = raw.toUpperCase().replace(/RH/gi, '').replace(/[\s.]/g, '').trim();
  const map: Record<string, string> = {
    'A+': 'A+',
    'A-': 'A-',
    'B+': 'B+',
    'B-': 'B-',
    'AB+': 'AB+',
    'AB-': 'AB-',
    'O+': 'O+',
    'O-': 'O-',
  };
  return map[s] || raw;
}

@Injectable()
export class EmployeesImportExportService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeStatus)
    private readonly statusRepository: Repository<EmployeeStatus>,
    @InjectRepository(EmployeeHistory)
    private readonly historyRepository: Repository<EmployeeHistory>,
    @InjectRepository(EmployeeEducation)
    private readonly educationRepository: Repository<EmployeeEducation>,
    @InjectRepository(EmployeeUniform)
    private readonly uniformRepository: Repository<EmployeeUniform>,
    @InjectRepository(EmployeeChild)
    private readonly childRepository: Repository<EmployeeChild>,
    @InjectRepository(EmployeeEmergencyContact)
    private readonly emergencyContactRepository: Repository<EmployeeEmergencyContact>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(MaritalStatus)
    private readonly maritalStatusRepository: Repository<MaritalStatus>,
    @InjectRepository(BloodType)
    private readonly bloodTypeRepository: Repository<BloodType>,
    private readonly dataSource: DataSource,
  ) {}

  async exportToExcel(): Promise<Buffer> {
    const employees = await this.employeeRepository.find({
      relations: {
        status: true,
        supervisor: true,
        department: true,
        genderRef: true,
        nationalityRef: true,
        maritalStatusRef: true,
        placeOfBirthRef: true,
        bloodTypeRef: true,
        educations: true,
        uniforms: true,
        children: true,
        emergencyContacts: true,
      },
      order: { fullName: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TalentHub';
    workbook.title = 'TalentHub - Employee Directory';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Employee Directory', {
      views: [{ state: 'frozen', ySplit: 2, showGridLines: false }],
    });

    sheet.columns = MAIN_COLUMNS;

    let colIndex = 1;
    for (const group of MAIN_GROUPS) {
      const endCol = colIndex + group.columns.length - 1;
      const cell = sheet.getCell(1, colIndex);
      cell.value = group.label;
      if (group.columns.length > 1) {
        sheet.mergeCells(1, colIndex, 1, endCol);
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: group.color },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = THIN_BORDER;
      colIndex = endCol + 1;
    }
    sheet.getRow(1).height = 26;

    for (let c = 1; c <= MAIN_COLUMNS.length; c++) {
      const cell = sheet.getCell(2, c);
      cell.value = MAIN_COLUMNS[c - 1].header;
    }
    styleHeaderRow(sheet.getRow(2), MAIN_COLUMNS.length);

    for (const emp of employees) {
      const uniform = emp.uniforms?.[0];

      sheet.addRow({
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone || '',
        phoneExtension: emp.phoneExtension || '',
        corporatePhone: emp.corporatePhone || '',
        satellitePhone: emp.satellitePhone || '',
        roomPhone: emp.roomPhone || '',
        mobilePhone: emp.mobilePhone || '',
        address: emp.address || '',
        birthDate: emp.birthDate || '',
        documentId: emp.documentId || '',
        gender: emp.genderRef?.name || '',
        nationality: emp.nationalityRef?.name || '',
        maritalStatus: emp.maritalStatusRef?.name || '',
        placeOfBirth: emp.placeOfBirthRef?.name || '',
        bloodType: emp.bloodTypeRef?.name || '',
        notes: emp.notes || '',
        department: emp.department?.name || '',
        position: emp.position || '',
        contractingCompany: emp.contractingCompany || '',
        hireDate: emp.hireDate || '',
        endDate: emp.endDate || '',
        salary: emp.salary ?? '',
        supervisor: emp.supervisor?.fullName || '',
        status: emp.status?.name || '',
        isActive: emp.isActive ? 'Yes' : 'No',
        shirtSize: uniform?.shirtSize || '',
        pantSize: uniform?.pantSize || '',
        shoeSize: uniform?.shoeSize || '',
        jacketSize: uniform?.jacketSize || '',
        helmetSize: uniform?.helmetSize || '',
      });
    }

    const rowCount = sheet.rowCount;
    for (let r = 3; r <= rowCount; r++) {
      const row = sheet.getRow(r);
      const isEven = r % 2 === 0;
      for (let c = 1; c <= MAIN_COLUMNS.length; c++) {
        const cell = row.getCell(c);
        cell.border = THIN_BORDER;
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      }
    }

    sheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: MAIN_COLUMNS.length },
    };

    const eduSheet = workbook.addWorksheet('Education', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
    });
    eduSheet.columns = EDUCATION_COLUMNS;
    styleHeaderRow(eduSheet.getRow(1), EDUCATION_COLUMNS.length);

    for (const emp of employees) {
      for (const edu of emp.educations ?? []) {
        eduSheet.addRow({
          employeeName: emp.fullName,
          educationLevel: edu.educationLevel || '',
          degree: edu.degree || '',
          institution: edu.institution || '',
          graduationYear: edu.graduationYear || '',
        });
      }
    }

    const eduDataRowCount = eduSheet.rowCount;
    for (let r = 2; r <= eduDataRowCount; r++) {
      const row = eduSheet.getRow(r);
      const isEven = r % 2 === 0;
      for (let c = 1; c <= EDUCATION_COLUMNS.length; c++) {
        const cell = row.getCell(c);
        cell.border = THIN_BORDER;
        cell.alignment = { vertical: 'middle' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      }
    }

    const childSheet = workbook.addWorksheet('Children', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
    });
    childSheet.columns = CHILD_COLUMNS;
    styleHeaderRow(childSheet.getRow(1), CHILD_COLUMNS.length);

    for (const emp of employees) {
      for (const child of emp.children ?? []) {
        childSheet.addRow({
          employeeName: emp.fullName,
          childName: child.name || '',
          birthDate: child.birthDate || '',
          gender: child.gender || '',
        });
      }
    }

    const childDataRowCount = childSheet.rowCount;
    for (let r = 2; r <= childDataRowCount; r++) {
      const row = childSheet.getRow(r);
      const isEven = r % 2 === 0;
      for (let c = 1; c <= CHILD_COLUMNS.length; c++) {
        const cell = row.getCell(c);
        cell.border = THIN_BORDER;
        cell.alignment = { vertical: 'middle' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      }
    }

    const contactSheet = workbook.addWorksheet('Emergency Contacts', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
    });
    contactSheet.columns = CONTACT_COLUMNS;
    styleHeaderRow(contactSheet.getRow(1), CONTACT_COLUMNS.length);

    for (const emp of employees) {
      for (const contact of emp.emergencyContacts ?? []) {
        contactSheet.addRow({
          employeeName: emp.fullName,
          contactName: contact.name || '',
          phone: contact.phone || '',
          relationship: contact.relationship || '',
        });
      }
    }

    const contactDataRowCount = contactSheet.rowCount;
    for (let r = 2; r <= contactDataRowCount; r++) {
      const row = contactSheet.getRow(r);
      const isEven = r % 2 === 0;
      for (let c = 1; c <= CONTACT_COLUMNS.length; c++) {
        const cell = row.getCell(c);
        cell.border = THIN_BORDER;
        cell.alignment = { vertical: 'middle' };
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TalentHub';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Employees', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
    });

    sheet.columns = ALL_COLUMNS;
    styleHeaderRow(sheet.getRow(1), ALL_COLUMNS.length);

    sheet.addRow({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0100',
      phoneExtension: '101',
      corporatePhone: '',
      satellitePhone: '',
      roomPhone: '',
      mobilePhone: '555-0101',
      address: '123 Main St',
      birthDate: '1990-05-15',
      documentId: 'DOC-001',
      gender: 'Male',
      nationality: 'American',
      maritalStatus: 'Single',
      placeOfBirth: 'New York',
      department: 'Engineering',
      position: 'Software Developer',
      contractingCompany: 'TechCorp',
      hireDate: '2024-01-15',
      endDate: '',
      salary: 75000,
      supervisor: '',
      status: 'Active',
      isActive: 'Yes',
      educationLevel: 'Bachelor',
      degree: 'Computer Science',
      institution: 'MIT',
      graduationYear: '2012',
      shirtSize: 'M',
      pantSize: '32',
      shoeSize: '10',
      jacketSize: 'L',
      helmetSize: '',
      notes: '',
      child1Name: '',
      child1BirthDate: '',
      child1Gender: '',
      child2Name: '',
      child2BirthDate: '',
      child2Gender: '',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '555-0102',
      emergencyContactRelationship: 'Spouse',
    });

    const rowCount = sheet.rowCount;
    for (let r = 2; r <= rowCount; r++) {
      const row = sheet.getRow(r);
      for (let c = 1; c <= ALL_COLUMNS.length; c++) {
        row.getCell(c).border = THIN_BORDER;
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importFromExcel(
    fileBuffer: Buffer,
    changedBy?: string,
    autoCreateDepartments?: string[],
    autoCreateBloodTypes?: string[],
  ): Promise<{ imported: number; errors: { row: number; message: string }[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as never);

    const sheet = workbook.getWorksheet(1);
    if (!sheet || sheet.rowCount < 2) {
      throw new BadRequestException(
        'The Excel file is empty or has no data rows',
      );
    }

    const errors: { row: number; message: string }[] = [];
    let imported = 0;

    const statuses = await this.statusRepository.find();
    const departments = await this.departmentRepository.find();
    const genders = await this.genderRepository.find();
    const countries = await this.countryRepository.find();
    const maritalStatuses = await this.maritalStatusRepository.find();
    const bloodTypes = await this.bloodTypeRepository.find();
    const allEmployees = await this.employeeRepository.find({
      select: { id: true, fullName: true },
    });

    const statusMap = new Map(
      statuses.map((s) => [s.name.toLowerCase().trim(), s.id]),
    );
    const departmentMap = new Map(
      departments.map((d) => [d.name.toLowerCase().trim(), d.id]),
    );
    const genderMap = new Map(
      genders.map((g) => [g.name.toLowerCase().trim(), g.id]),
    );
    const countryMap = new Map(
      countries.map((c) => [c.name.toLowerCase().trim(), c.id]),
    );
    const maritalStatusMap = new Map(
      maritalStatuses.map((m) => [m.name.toLowerCase().trim(), m.id]),
    );
    const bloodTypeMap = new Map(
      bloodTypes.map((bt) => [normalizeBloodType(bt.name), bt.id]),
    );
    const employeeNameMap = new Map(
      allEmployees.map((e) => [e.fullName.toLowerCase().trim(), e.id]),
    );

    const headerRow = sheet.getRow(1);
    const columnKeys: string[] = [];

    const ALIAS_MAP: Record<string, string> = {
      nombre: 'fullName',
      'full name': 'fullName',
      email: 'email',
      correo: 'email',
      telefono: 'phone',
      phone: 'phone',
      tel: 'phone',
      extension: 'phoneExtension',
      extens: 'phoneExtension',
      ext: 'phoneExtension',
      'telefono corporativo': 'corporatePhone',
      tel_corpo_empleado_ccs: 'corporatePhone',
      'corporate phone': 'corporatePhone',
      'telefono satelital': 'satellitePhone',
      tel_satelital_empleado_ccs: 'satellitePhone',
      'satellite phone': 'satellitePhone',
      'telefono habitacion': 'roomPhone',
      'room phone': 'roomPhone',
      celular: 'mobilePhone',
      'mobile phone': 'mobilePhone',
      'telefono celular': 'mobilePhone',
      direccion: 'address',
      address: 'address',
      ubicacion: 'address',
      location: 'address',
      edad: 'age',
      age: 'age',
      'fecha nacimiento': 'birthDate',
      fecha_nac: 'birthDate',
      'birth date': 'birthDate',
      cedula: 'documentId',
      'document id': 'documentId',
      documento: 'documentId',
      genero: 'gender',
      gender: 'gender',
      sexo: 'gender',
      nacionalidad: 'nationality',
      nationality: 'nationality',
      'estado civil': 'maritalStatus',
      'marital status': 'maritalStatus',
      'lugar nacimiento': 'placeOfBirth',
      'place of birth': 'placeOfBirth',
      departamento: 'department',
      department: 'department',
      gerencia_empleado_ccs: 'department',
      gerencia: 'department',
      cargo: 'position',
      position: 'position',
      puesto: 'position',
      empresa: 'contractingCompany',
      empresa_empleado_ccs: 'contractingCompany',
      'contracting company': 'contractingCompany',
      'fecha ingreso': 'hireDate',
      'hire date': 'hireDate',
      fecha_ingreso: 'hireDate',
      'fecha salida': 'endDate',
      'end date': 'endDate',
      salario: 'salary',
      salary: 'salary',
      supervisor: 'supervisor',
      estado: 'status',
      status: 'status',
      activo: 'isActive',
      'is active': 'isActive',
      'nivel educativo': 'educationLevel',
      'education level': 'educationLevel',
      titulo: 'degree',
      degree: 'degree',
      carrera: 'degree',
      institucion: 'institution',
      institution: 'institution',
      universidad: 'institution',
      'anio graduacion': 'graduationYear',
      'graduation year': 'graduationYear',
      'talla camisa': 'shirtSize',
      'shirt size': 'shirtSize',
      'talla pantalon': 'pantSize',
      'pant size': 'pantSize',
      'talla zapato': 'shoeSize',
      'shoe size': 'shoeSize',
      'talla chaqueta': 'jacketSize',
      'jacket size': 'jacketSize',
      'talla casco': 'helmetSize',
      'helmet size': 'helmetSize',
      notas: 'notes',
      notes: 'notes',
      observaciones: 'notes',
      observations: 'notes',
      'tipo sangre': 'bloodType',
      tipo_sangre: 'bloodType',
      'blood type': 'bloodType',
      'nombre hijo 1': 'child1Name',
      'child 1 name': 'child1Name',
      'fecha nacimiento hijo 1': 'child1BirthDate',
      'child 1 birth date': 'child1BirthDate',
      'genero hijo 1': 'child1Gender',
      'child 1 gender': 'child1Gender',
      'nombre hijo 2': 'child2Name',
      'child 2 name': 'child2Name',
      'fecha nacimiento hijo 2': 'child2BirthDate',
      'child 2 birth date': 'child2BirthDate',
      'genero hijo 2': 'child2Gender',
      'child 2 gender': 'child2Gender',
      'contacto emergencia': 'emergencyContactName',
      'emergency contact name': 'emergencyContactName',
      contacto_emergencia: 'emergencyContactName',
      'telefono emergencia': 'emergencyContactPhone',
      'emergency contact phone': 'emergencyContactPhone',
      'tlf. emerge1': 'emergencyContactPhone',
      'tlf. emerg2': 'emergencyContactPhone2',
      'tlf. emerg3': 'emergencyContactPhone3',
      parentesco: 'emergencyContactRelationship',
      'emergency contact relationship': 'emergencyContactRelationship',
      parentesco_empleado_ccs: 'emergencyContactRelationship',
      parentesco2: 'emergencyContactRelationship2',
      parentesco3: 'emergencyContactRelationship3',
      texto262: 'emergencyContactName2',
      texto266: 'emergencyContactName3',
      texto270: 'emergencyContactName3',
    };

    headerRow.eachCell((cell, colNumber) => {
      const raw = cellToString(cell.value).trim();
      const lower = raw.toLowerCase().trim();
      const colDef = ALL_COLUMNS.find((c) => c.header.toLowerCase() === lower);
      if (colDef) {
        columnKeys[colNumber] = colDef.key;
      } else if (ALIAS_MAP[lower]) {
        columnKeys[colNumber] = ALIAS_MAP[lower];
      } else {
        columnKeys[colNumber] = '';
      }
    });

    const result = await this.dataSource.transaction(async (manager) => {
      if (autoCreateDepartments?.length) {
        for (const name of autoCreateDepartments) {
          const key = name.toLowerCase().trim();
          if (!departmentMap.has(key)) {
            const created = manager.create(Department, {
              name: name.trim(),
              isActive: true,
            });
            const saved = await manager.save(Department, created);
            departmentMap.set(key, saved.id);
          }
        }
      }

      if (autoCreateBloodTypes?.length) {
        for (const name of autoCreateBloodTypes) {
          const normalized = normalizeBloodType(name);
          if (!bloodTypeMap.has(normalized)) {
            const created = manager.create(BloodType, {
              name: normalized,
              value: normalized,
              isActive: true,
            });
            const saved = await manager.save(BloodType, created);
            bloodTypeMap.set(normalized, saved.id);
          }
        }
      }

      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const firstCell = row.getCell(1);
        if (!firstCell.value) continue;

        const getVal = (colKey: string): string => {
          const colIndex = columnKeys.indexOf(colKey);
          if (colIndex === -1) return '';
          const cell = row.getCell(colIndex);
          return cellToString(cell.value);
        };

        const fullName = normalizeFullName(getVal('fullName'));
        const email = getVal('email');

        if (!fullName) {
          errors.push({ row: i, message: 'Full Name is required' });
          continue;
        }

        const statusName = getVal('status');
        let statusId = statusName
          ? statusMap.get(statusName.toLowerCase().trim())
          : undefined;
        if (!statusId) {
          const defaultStatus =
            statuses.find((s) => s.name.toLowerCase() === 'active') ||
            statuses.find((s) => s.isActive) ||
            statuses[0];
          if (defaultStatus) {
            statusId = defaultStatus.id;
          } else {
            errors.push({
              row: i,
              message: `Status "${statusName}" not found and no default status available`,
            });
            continue;
          }
        }

        const departmentName = getVal('department');
        const departmentId = departmentName
          ? departmentMap.get(departmentName.toLowerCase().trim())
          : undefined;
        const genderName = getVal('gender');
        const genderId = genderName
          ? genderMap.get(genderName.toLowerCase().trim())
          : undefined;
        const nationalityName = getVal('nationality');
        const nationalityId = nationalityName
          ? countryMap.get(nationalityName.toLowerCase().trim())
          : undefined;
        const maritalStatusName = getVal('maritalStatus');
        const maritalStatusId = maritalStatusName
          ? maritalStatusMap.get(maritalStatusName.toLowerCase().trim())
          : undefined;
        const placeOfBirthName = getVal('placeOfBirth');
        const placeOfBirthId = placeOfBirthName
          ? countryMap.get(placeOfBirthName.toLowerCase().trim())
          : undefined;
        const bloodTypeName = getVal('bloodType');
        const bloodTypeId = bloodTypeName
          ? bloodTypeMap.get(normalizeBloodType(bloodTypeName))
          : undefined;
        const supervisorName = getVal('supervisor');
        const supervisorId = supervisorName
          ? employeeNameMap.get(supervisorName.toLowerCase().trim())
          : undefined;

        const isActiveStr = getVal('isActive');
        const isActive = isActiveStr
          ? isActiveStr.toLowerCase() !== 'no'
          : true;
        const salaryStr = getVal('salary');
        const salary = salaryStr ? parseFloat(salaryStr) : undefined;

        const employee = manager.create(Employee, {
          fullName,
          email: email || undefined,
          phone: getVal('phone') || undefined,
          phoneExtension: getVal('phoneExtension') || undefined,
          corporatePhone: getVal('corporatePhone') || undefined,
          satellitePhone: getVal('satellitePhone') || undefined,
          roomPhone: getVal('roomPhone') || undefined,
          mobilePhone: getVal('mobilePhone') || undefined,
          address: getVal('address') || undefined,
          birthDate: getVal('birthDate') || undefined,
          documentId: getVal('documentId') || undefined,
          genderId: genderId || undefined,
          nationalityId: nationalityId || undefined,
          maritalStatusId: maritalStatusId || undefined,
          placeOfBirthId: placeOfBirthId || undefined,
          departmentId: departmentId || undefined,
          position: getVal('position') || undefined,
          contractingCompany: getVal('contractingCompany') || undefined,
          hireDate: getVal('hireDate') || undefined,
          endDate: getVal('endDate') || undefined,
          salary: isNaN(Number(salary)) ? undefined : salary,
          supervisorId: supervisorId || undefined,
          statusId,
          isActive,
          notes: getVal('notes') || undefined,
          bloodTypeId: bloodTypeId || undefined,
        });

        const saved = await manager.save(Employee, employee);

        const educationLevel = getVal('educationLevel');
        const degree = getVal('degree');
        const institution = getVal('institution');
        const graduationYear = getVal('graduationYear');
        if (educationLevel || degree || institution || graduationYear) {
          await manager.save(
            EmployeeEducation,
            manager.create(EmployeeEducation, {
              employeeId: saved.id,
              educationLevel: educationLevel || undefined,
              degree: degree || undefined,
              institution: institution || undefined,
              graduationYear: graduationYear || undefined,
            }),
          );
        }

        const shirtSize = getVal('shirtSize');
        const pantSize = getVal('pantSize');
        const shoeSize = getVal('shoeSize');
        const jacketSize = getVal('jacketSize');
        const helmetSize = getVal('helmetSize');
        if (shirtSize || pantSize || shoeSize || jacketSize || helmetSize) {
          await manager.save(
            EmployeeUniform,
            manager.create(EmployeeUniform, {
              employeeId: saved.id,
              shirtSize: shirtSize || undefined,
              pantSize: pantSize || undefined,
              shoeSize: shoeSize || undefined,
              jacketSize: jacketSize || undefined,
              helmetSize: helmetSize || undefined,
            }),
          );
        }

        const child1Name = getVal('child1Name');
        if (child1Name) {
          await manager.save(
            EmployeeChild,
            manager.create(EmployeeChild, {
              employeeId: saved.id,
              name: child1Name,
              birthDate: getVal('child1BirthDate') || undefined,
              gender: getVal('child1Gender') || undefined,
            }),
          );
        }
        const child2Name = getVal('child2Name');
        if (child2Name) {
          await manager.save(
            EmployeeChild,
            manager.create(EmployeeChild, {
              employeeId: saved.id,
              name: child2Name,
              birthDate: getVal('child2BirthDate') || undefined,
              gender: getVal('child2Gender') || undefined,
            }),
          );
        }

        const emergencyName = getVal('emergencyContactName');
        if (emergencyName) {
          await manager.save(
            EmployeeEmergencyContact,
            manager.create(EmployeeEmergencyContact, {
              employeeId: saved.id,
              name: emergencyName,
              phone: getVal('emergencyContactPhone') || undefined,
              relationship: getVal('emergencyContactRelationship') || undefined,
            }),
          );
        }

        const emergencyName2 = getVal('emergencyContactName2');
        if (emergencyName2) {
          await manager.save(
            EmployeeEmergencyContact,
            manager.create(EmployeeEmergencyContact, {
              employeeId: saved.id,
              name: emergencyName2,
              phone: getVal('emergencyContactPhone2') || undefined,
              relationship:
                getVal('emergencyContactRelationship2') || undefined,
            }),
          );
        }

        const emergencyName3 = getVal('emergencyContactName3');
        if (emergencyName3) {
          await manager.save(
            EmployeeEmergencyContact,
            manager.create(EmployeeEmergencyContact, {
              employeeId: saved.id,
              name: emergencyName3,
              phone: getVal('emergencyContactPhone3') || undefined,
              relationship:
                getVal('emergencyContactRelationship3') || undefined,
            }),
          );
        }

        const historyEntry = manager.create(EmployeeHistory, {
          employeeId: saved.id,
          changedField: 'status',
          newValue: statusName,
          changedBy: changedBy ?? '',
          notes: 'Imported from Excel',
        });
        await manager.save(EmployeeHistory, historyEntry);

        imported++;
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      return { imported, errors };
    });

    return result;
  }

  async previewFromExcel(fileBuffer: Buffer): Promise<{
    totalRows: number;
    mappedColumns: { excelHeader: string; mappedTo: string }[];
    unmappedColumns: string[];
    sampleData: Record<string, string>[];
    duplicateNames: string[];
    warnings: string[];
    missingCatalogs: {
      departments: { name: string; affectedRows: number }[];
      bloodTypes: { name: string; affectedRows: number }[];
    };
    catalogSummary: {
      departments: string[];
      statuses: string[];
      genders: string[];
      bloodTypes: string[];
    };
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as never);

    const sheet = workbook.getWorksheet(1);
    if (!sheet || sheet.rowCount < 2) {
      throw new BadRequestException(
        'The Excel file is empty or has no data rows',
      );
    }

    const statuses = await this.statusRepository.find();
    const departments = await this.departmentRepository.find();
    const genders = await this.genderRepository.find();
    const bloodTypes = await this.bloodTypeRepository.find();
    const allEmployees = await this.employeeRepository.find({
      select: { id: true, fullName: true },
    });

    const statusMap = new Map(
      statuses.map((s) => [s.name.toLowerCase().trim(), s.id]),
    );
    const departmentMap = new Map(
      departments.map((d) => [d.name.toLowerCase().trim(), d.id]),
    );
    const genderMap = new Map(
      genders.map((g) => [g.name.toLowerCase().trim(), g.id]),
    );
    const bloodTypeMap = new Map(
      bloodTypes.map((bt) => [normalizeBloodType(bt.name), bt.id]),
    );
    const employeeNameMap = new Map(
      allEmployees.map((e) => [e.fullName.toLowerCase().trim(), e.id]),
    );

    const headerRow = sheet.getRow(1);
    const columnKeys: string[] = [];
    const mappedColumns: { excelHeader: string; mappedTo: string }[] = [];
    const unmappedColumns: string[] = [];

    const ALIAS_MAP: Record<string, string> = {
      nombre: 'fullName',
      'full name': 'fullName',
      email: 'email',
      correo: 'email',
      telefono: 'phone',
      phone: 'phone',
      tel: 'phone',
      extension: 'phoneExtension',
      extens: 'phoneExtension',
      ext: 'phoneExtension',
      'telefono corporativo': 'corporatePhone',
      tel_corpo_empleado_ccs: 'corporatePhone',
      'corporate phone': 'corporatePhone',
      'telefono satelital': 'satellitePhone',
      tel_satelital_empleado_ccs: 'satellitePhone',
      'satellite phone': 'satellitePhone',
      'telefono habitacion': 'roomPhone',
      'room phone': 'roomPhone',
      celular: 'mobilePhone',
      'mobile phone': 'mobilePhone',
      'telefono celular': 'mobilePhone',
      direccion: 'address',
      address: 'address',
      ubicacion: 'address',
      location: 'address',
      edad: 'age',
      age: 'age',
      'fecha nacimiento': 'birthDate',
      fecha_nac: 'birthDate',
      'birth date': 'birthDate',
      cedula: 'documentId',
      'document id': 'documentId',
      documento: 'documentId',
      genero: 'gender',
      gender: 'gender',
      sexo: 'gender',
      nacionalidad: 'nationality',
      nationality: 'nationality',
      'estado civil': 'maritalStatus',
      'marital status': 'maritalStatus',
      'lugar nacimiento': 'placeOfBirth',
      'place of birth': 'placeOfBirth',
      departamento: 'department',
      department: 'department',
      gerencia_empleado_ccs: 'department',
      gerencia: 'department',
      cargo: 'position',
      position: 'position',
      puesto: 'position',
      empresa: 'contractingCompany',
      empresa_empleado_ccs: 'contractingCompany',
      'contracting company': 'contractingCompany',
      'fecha ingreso': 'hireDate',
      'hire date': 'hireDate',
      fecha_ingreso: 'hireDate',
      'fecha salida': 'endDate',
      'end date': 'endDate',
      salario: 'salary',
      salary: 'salary',
      supervisor: 'supervisor',
      jefe: 'supervisor',
      status: 'status',
      estado: 'status',
      'is active': 'isActive',
      activo: 'isActive',
      'nivel educacion': 'educationLevel',
      'education level': 'educationLevel',
      titulo: 'degree',
      degree: 'degree',
      carrera: 'degree',
      institucion: 'institution',
      institution: 'institution',
      universidad: 'institution',
      'anio graduacion': 'graduationYear',
      'graduation year': 'graduationYear',
      anio_graduacion: 'graduationYear',
      'talla camisa': 'shirtSize',
      'shirt size': 'shirtSize',
      'talla pantalon': 'pantSize',
      'pant size': 'pantSize',
      'talla zapato': 'shoeSize',
      'shoe size': 'shoeSize',
      'talla chaqueta': 'jacketSize',
      'jacket size': 'jacketSize',
      'talla casco': 'helmetSize',
      'helmet size': 'helmetSize',
      'tipo sangre': 'bloodType',
      tipo_sangre: 'bloodType',
      'blood type': 'bloodType',
      notas: 'notes',
      notes: 'notes',
      observaciones: 'notes',
      observations: 'notes',
      'child 1 name': 'child1Name',
      'hijo 1 nombre': 'child1Name',
      'child 1 birth date': 'child1BirthDate',
      'hijo 1 fecha nacimiento': 'child1BirthDate',
      'child 1 gender': 'child1Gender',
      'hijo 1 genero': 'child1Gender',
      'child 2 name': 'child2Name',
      'hijo 2 nombre': 'child2Name',
      'child 2 birth date': 'child2BirthDate',
      'hijo 2 fecha nacimiento': 'child2BirthDate',
      'child 2 gender': 'child2Gender',
      'hijo 2 genero': 'child2Gender',
      'emergency contact name': 'emergencyContactName',
      'contacto emergencia nombre': 'emergencyContactName',
      emerg_contact_name: 'emergencyContactName',
      contacto_emergencia: 'emergencyContactName',
      'emergency contact phone': 'emergencyContactPhone',
      'contacto emergencia telefono': 'emergencyContactPhone',
      emerg_contact_phone: 'emergencyContactPhone',
      'tlf. emerge1': 'emergencyContactPhone',
      'tlf. emerg2': 'emergencyContactPhone2',
      'tlf. emerg3': 'emergencyContactPhone3',
      'emergency contact relationship': 'emergencyContactRelationship',
      'contacto emergencia parentesco': 'emergencyContactRelationship',
      emerg_contact_relationship: 'emergencyContactRelationship',
      parentesco: 'emergencyContactRelationship',
      parentesco_empleado_ccs: 'emergencyContactRelationship',
      contacto2: 'emergencyContactName2',
      emerg_contact_name2: 'emergencyContactName2',
      'telefono contacto2': 'emergencyContactPhone2',
      emerg_contact_phone2: 'emergencyContactPhone2',
      parentesco2: 'emergencyContactRelationship2',
      emerg_contact_relationship2: 'emergencyContactRelationship2',
      contacto3: 'emergencyContactName3',
      emerg_contact_name3: 'emergencyContactName3',
      'telefono contacto3': 'emergencyContactPhone3',
      emerg_contact_phone3: 'emergencyContactPhone3',
      parentesco3: 'emergencyContactRelationship3',
      emerg_contact_relationship3: 'emergencyContactRelationship3',
      texto262: 'emergencyContactName2',
      texto266: 'emergencyContactName3',
      texto270: 'emergencyContactName3',
    };

    headerRow.eachCell((cell, colNumber) => {
      const raw = cellToString(cell.value).trim();
      const lower = raw.toLowerCase().trim();
      const colDef = ALL_COLUMNS.find((c) => c.header.toLowerCase() === lower);
      if (colDef) {
        columnKeys[colNumber] = colDef.key;
        mappedColumns.push({ excelHeader: raw, mappedTo: colDef.key });
      } else if (ALIAS_MAP[lower]) {
        columnKeys[colNumber] = ALIAS_MAP[lower];
        mappedColumns.push({ excelHeader: raw, mappedTo: ALIAS_MAP[lower] });
      } else {
        columnKeys[colNumber] = '';
        unmappedColumns.push(raw);
      }
    });

    const dataRowCount = sheet.rowCount - 1;
    const sampleData: Record<string, string>[] = [];
    const warnings: string[] = [];
    const duplicateNames: string[] = [];
    const foundDepartments = new Set<string>();
    const foundStatuses = new Set<string>();
    const foundGenders = new Set<string>();
    const foundBloodTypes = new Set<string>();
    const missingDepartments = new Map<string, number>();
    const missingBloodTypes = new Map<string, number>();

    const MAX_SAMPLE = 5;
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const firstCell = row.getCell(1);
      if (!firstCell.value) continue;

      const getVal = (colKey: string): string => {
        const colIndex = columnKeys.indexOf(colKey);
        if (colIndex === -1) return '';
        const cell = row.getCell(colIndex);
        return cellToString(cell.value);
      };

      const fullName = normalizeFullName(getVal('fullName'));
      if (!fullName) {
        warnings.push(`Row ${i}: missing Full Name — will be skipped`);
        continue;
      }

      const normalizedName = fullName.toLowerCase().trim();
      if (employeeNameMap.has(normalizedName)) {
        duplicateNames.push(fullName);
      }

      const departmentName = getVal('department');
      if (
        departmentName &&
        !departmentMap.has(departmentName.toLowerCase().trim())
      ) {
        const key = departmentName.trim();
        missingDepartments.set(key, (missingDepartments.get(key) || 0) + 1);
      } else if (departmentName) {
        foundDepartments.add(departmentName);
      }

      const statusName = getVal('status');
      if (statusName && !statusMap.has(statusName.toLowerCase().trim())) {
        warnings.push(
          `Row ${i}: status "${statusName}" not found — will use default`,
        );
      } else if (statusName) {
        foundStatuses.add(statusName);
      }

      const genderName = getVal('gender');
      if (genderName && !genderMap.has(genderName.toLowerCase().trim())) {
        warnings.push(`Row ${i}: gender "${genderName}" not found in catalog`);
      } else if (genderName) {
        foundGenders.add(genderName);
      }

      const bloodTypeName = getVal('bloodType');
      if (
        bloodTypeName &&
        !bloodTypeMap.has(normalizeBloodType(bloodTypeName))
      ) {
        const key = bloodTypeName.trim();
        missingBloodTypes.set(key, (missingBloodTypes.get(key) || 0) + 1);
      } else if (bloodTypeName) {
        foundBloodTypes.add(bloodTypeName);
      }

      if (sampleData.length < MAX_SAMPLE) {
        const rowSample: Record<string, string> = {};
        for (const mc of mappedColumns) {
          const colIndex = columnKeys.indexOf(mc.mappedTo);
          if (colIndex !== -1) {
            const cell = row.getCell(colIndex);
            const val = cell.value;
            rowSample[mc.excelHeader] = cellToString(val).trim();
          }
        }
        rowSample['_row'] = String(i);
        sampleData.push(rowSample);
      }
    }

    return {
      totalRows: dataRowCount,
      mappedColumns,
      unmappedColumns,
      sampleData,
      duplicateNames,
      warnings,
      missingCatalogs: {
        departments: [...missingDepartments.entries()].map(([name, count]) => ({
          name,
          affectedRows: count,
        })),
        bloodTypes: [...missingBloodTypes.entries()].map(([name, count]) => ({
          name,
          affectedRows: count,
        })),
      },
      catalogSummary: {
        departments: [...foundDepartments],
        statuses: [...foundStatuses],
        genders: [...foundGenders],
        bloodTypes: [...foundBloodTypes],
      },
    };
  }
}
