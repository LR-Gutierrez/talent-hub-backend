import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly settingsService: CompanySettingsService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'CompanySettings')
  get() {
    return this.settingsService.getSettings();
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Put()
  @RequireAbility('update', 'CompanySettings')
  update(@Body() dto: UpdateCompanySettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
