var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
export class QueryUsersDto {
    search;
    role;
    department_id;
    wilayah_id;
    cabang_id;
    page = 1;
    limit = 10;
}
__decorate([
    ApiPropertyOptional({ description: 'Cari berdasarkan nama atau email' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional({ enum: Role, description: 'Filter peran' }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], QueryUsersDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter berdasarkan ID Department' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "department_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter berdasarkan ID Wilayah' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "wilayah_id", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filter berdasarkan ID Cabang' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "cabang_id", void 0);
__decorate([
    ApiPropertyOptional({ default: 1, description: 'Nomor halaman' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 10, description: 'Batas data per halaman' }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    __metadata("design:type", Number)
], QueryUsersDto.prototype, "limit", void 0);
//# sourceMappingURL=query-users.dto.js.map