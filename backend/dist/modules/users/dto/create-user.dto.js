var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
export class CreateUserDto {
    nama;
    email;
    password;
    role;
    department_id;
    wilayah_id;
    cabang_id;
}
__decorate([
    ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nama", void 0);
__decorate([
    ApiProperty({ example: 'budi@example.com', description: 'Alamat email aktif' }),
    IsNotEmpty(),
    IsEmail(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'password123', description: 'Password akun (minimal 6 karakter)' }),
    IsNotEmpty(),
    IsString(),
    MinLength(6),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ enum: Role, default: Role.siswa, description: 'Peran pengguna (siswa, admin, superadmin)' }),
    IsNotEmpty(),
    IsEnum(Role),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Jurusan/Department' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "department_id", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Wilayah' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "wilayah_id", void 0);
__decorate([
    ApiPropertyOptional({ example: 1, description: 'ID Cabang' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "cabang_id", void 0);
//# sourceMappingURL=create-user.dto.js.map