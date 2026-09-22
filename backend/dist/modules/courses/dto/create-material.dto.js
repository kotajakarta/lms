var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';
export class CreateMaterialDto {
    judul;
    deskripsi;
    tipe;
    video_url;
    duration_minutes;
    urutan;
}
__decorate([
    ApiProperty({ example: 'Pengantar Perspektif' }),
    IsNotEmpty(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "judul", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "deskripsi", void 0);
__decorate([
    ApiProperty({ enum: MaterialType }),
    IsEnum(MaterialType),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "tipe", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=...' }),
    IsOptional(),
    IsUrl({ protocols: ['http', 'https'], require_protocol: true }),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "video_url", void 0);
__decorate([
    ApiPropertyOptional({ default: 0 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateMaterialDto.prototype, "duration_minutes", void 0);
__decorate([
    ApiPropertyOptional({ default: 0 }),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateMaterialDto.prototype, "urutan", void 0);
//# sourceMappingURL=create-material.dto.js.map