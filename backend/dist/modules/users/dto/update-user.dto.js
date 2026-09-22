var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsEmail, IsEnum, IsInt, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
export class UpdateUserDto {
    nama;
    email;
    password;
    role;
    department_id;
    wilayah_id;
    cabang_id;
}
__decorate([
    ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "nama", void 0);
__decorate([
    ApiPropertyOptional({ example: 'budi@example.com', description: 'Alamat email aktif' }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: 'newpassword123', description: 'Password baru (kosongkan jika tidak diubah)' }),
    IsOptional(),
    IsString(),
    MinLength(6),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({ enum: Role, description: 'Peran pengguna' }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Jurusan/Department' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "department_id", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Wilayah' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "wilayah_id", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Cabang' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "cabang_id", void 0);
//# sourceMappingURL=update-user.dto.js.map