var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateCourseDto {
    judul;
    deskripsi;
    thumbnail;
    nama_instruktur;
    start_date;
    end_date;
    department_ids;
}
__decorate([
    ApiProperty({ example: 'Spatial Design Fundamentals' }),
    IsNotEmpty(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "judul", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Dasar-dasar berpikir spasial dan desain.' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "deskripsi", void 0);
__decorate([
    ApiPropertyOptional({ example: 'default.jpg' }),
    IsOptional(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "thumbnail", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Prof. Elena Rostova' }),
    IsOptional(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "nama_instruktur", void 0);
__decorate([
    ApiPropertyOptional({ example: '2026-10-01' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "start_date", void 0);
__decorate([
    ApiPropertyOptional({ example: '2026-12-31' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "end_date", void 0);
__decorate([
    ApiPropertyOptional({ example: [1, 2], type: [Number] }),
    IsOptional(),
    IsArray(),
    IsInt({ each: true }),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "department_ids", void 0);
//# sourceMappingURL=create-course.dto.js.map