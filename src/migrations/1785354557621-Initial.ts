import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1785354557621 implements MigrationInterface {
  name = 'Initial1785354557621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blood_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_aee1798735ce7555a6e943308ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "education_levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_87650fa9bdce80639107ce2ba23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_degrees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_55bab8cfd81d06255cb7280421a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "countries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "dialCode" character varying(10) NOT NULL, CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_529fb131dd4164c94529f53e19d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "marital_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_77764a760ef13fa28259e987c4d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "uniform_sizes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "value" character varying(100), "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "translations" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "category" character varying(50) NOT NULL, CONSTRAINT "PK_58fc34c324dce64e0880748fa05" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyName" character varying NOT NULL, "companyRuc" character varying, "companyLogo" character varying, "companyAddress" character varying, "companyPhone" character varying, "companyEmail" character varying, "timezone" character varying NOT NULL DEFAULT 'America/Caracas', "dateFormat" character varying NOT NULL DEFAULT 'DD/MM/YYYY', "currency" character varying NOT NULL DEFAULT 'USD', "defaultLang" character varying NOT NULL DEFAULT 'es', "favicon" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_036b4634217db79c17305442dbe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "color" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_5129ff71493b0ceacfe785687a8" UNIQUE ("name"), CONSTRAINT "PK_002adb1bf8f8e84e808e753e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_educations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "educationLevel" character varying, "degree" character varying, "institution" character varying, "graduationYear" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_3755bc5568c47c9cd8ed2d468b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_uniforms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "shirtSize" character varying, "pantSize" character varying, "shoeSize" character varying, "jacketSize" character varying, "helmetSize" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_301c1e88271025ffd66fb115caf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_emergency_contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "relationship" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_1bdc864d96d84ec70e0df9965c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "email" character varying, "phone" character varying, "phoneExtension" character varying, "corporatePhone" character varying, "satellitePhone" character varying, "roomPhone" character varying, "mobilePhone" character varying, "address" character varying, "birthDate" date, "documentId" character varying, "genderId" uuid, "nationalityId" uuid, "maritalStatusId" uuid, "placeOfBirthId" uuid, "notes" text, "photoUrl" character varying, "bloodTypeId" uuid, "departmentId" uuid, "position" character varying, "contractingCompany" character varying, "hireDate" date, "endDate" date, "salary" numeric(10,2), "supervisorId" uuid, "statusId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_children" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "name" character varying NOT NULL, "birthDate" date, "gender" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_9b11d6d1209d70da0760657867e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "changedField" character varying NOT NULL, "oldValue" text, "newValue" text, "changedBy" character varying, "notes" text, "changedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_69f9bbe2842de908de4e5e097dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'recruiter', 'candidate')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "displayName" character varying, "photoUrl" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'candidate', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_educations" ADD CONSTRAINT "FK_6b740ac8ce31f71897d3e9d4eb7" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_uniforms" ADD CONSTRAINT "FK_d495e2c7ab6b00236ae947c0b58" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT "FK_c60cd1bbdf1ffdb51080e2b3270" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_c26c2c6f1b1a7c7a5fda8e60488" FOREIGN KEY ("genderId") REFERENCES "genders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_3f971a5b80f0097a0f157a76882" FOREIGN KEY ("nationalityId") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_d7f5bcf3261a6fe0b4c61cb4df8" FOREIGN KEY ("maritalStatusId") REFERENCES "marital_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_ac89ea72a9d3e5f04121b8bcff9" FOREIGN KEY ("placeOfBirthId") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_93b570e423e0f79d782955bde85" FOREIGN KEY ("bloodTypeId") REFERENCES "blood_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_cf65986a1aca4c9da695923dc02" FOREIGN KEY ("supervisorId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_4e3317126ac0ae22a75b083953d" FOREIGN KEY ("statusId") REFERENCES "employee_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_children" ADD CONSTRAINT "FK_b80c9b1dc561cb8282eceb30a88" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_history" ADD CONSTRAINT "FK_0974f458d521e32d5a12d6c5a2e" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_history" DROP CONSTRAINT "FK_0974f458d521e32d5a12d6c5a2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_children" DROP CONSTRAINT "FK_b80c9b1dc561cb8282eceb30a88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_4e3317126ac0ae22a75b083953d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_cf65986a1aca4c9da695923dc02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_93b570e423e0f79d782955bde85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_ac89ea72a9d3e5f04121b8bcff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_d7f5bcf3261a6fe0b4c61cb4df8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_3f971a5b80f0097a0f157a76882"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_c26c2c6f1b1a7c7a5fda8e60488"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_emergency_contacts" DROP CONSTRAINT "FK_c60cd1bbdf1ffdb51080e2b3270"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_uniforms" DROP CONSTRAINT "FK_d495e2c7ab6b00236ae947c0b58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_educations" DROP CONSTRAINT "FK_6b740ac8ce31f71897d3e9d4eb7"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "employee_history"`);
    await queryRunner.query(`DROP TABLE "employee_children"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "employee_emergency_contacts"`);
    await queryRunner.query(`DROP TABLE "employee_uniforms"`);
    await queryRunner.query(`DROP TABLE "employee_educations"`);
    await queryRunner.query(`DROP TABLE "employee_statuses"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "company_settings"`);
    await queryRunner.query(`DROP TABLE "uniform_sizes"`);
    await queryRunner.query(`DROP TABLE "marital_statuses"`);
    await queryRunner.query(`DROP TABLE "genders"`);
    await queryRunner.query(`DROP TABLE "countries"`);
    await queryRunner.query(`DROP TABLE "employee_degrees"`);
    await queryRunner.query(`DROP TABLE "education_levels"`);
    await queryRunner.query(`DROP TABLE "blood_types"`);
  }
}
