var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateDiscussionDto {
    course_id;
    judul;
    isi;
}
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], CreateDiscussionDto.prototype, "course_id", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    MaxLength(255),
    __metadata("design:type", String)
], CreateDiscussionDto.prototype, "judul", void 0);
__decorate([
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], CreateDiscussionDto.prototype, "isi", void 0);
//# sourceMappingURL=create-discussion.dto.js.map