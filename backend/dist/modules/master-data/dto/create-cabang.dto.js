var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCabangDto {
    nama_cabang;
    wilayah_id;
}
__decorate([
    ApiProperty({ example: 'Bandung', description: 'Nama cabang' }),
    IsNotEmpty(),
    IsString(),
    MaxLength(150),
    __metadata("design:type", String)
], CreateCabangDto.prototype, "nama_cabang", void 0);
__decorate([
    ApiProperty({ example: 1, description: 'ID Wilayah induk' }),
    IsNotEmpty(),
    IsInt(),
    __metadata("design:type", Number)
], CreateCabangDto.prototype, "wilayah_id", void 0);
//# sourceMappingURL=create-cabang.dto.js.map