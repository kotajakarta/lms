import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LMS database seeding...');

  // 1. Seed Wilayah
  const wilayahList = [
    { nama_wilayah: 'DKI Jakarta' },
    { nama_wilayah: 'Jawa Barat' },
    { nama_wilayah: 'Jawa Tengah' },
    { nama_wilayah: 'Jawa Timur' },
    { nama_wilayah: 'Banten' },
    { nama_wilayah: 'DI Yogyakarta' },
  ];

  for (const w of wilayahList) {
    const existing = await prisma.wilayah.findFirst({ where: { nama_wilayah: w.nama_wilayah } });
    if (!existing) {
      await prisma.wilayah.create({ data: w });
    }
  }
  console.log('✅ Wilayah seeded.');

  const jabar = await prisma.wilayah.findFirst({ where: { nama_wilayah: 'Jawa Barat' } });
  const dki = await prisma.wilayah.findFirst({ where: { nama_wilayah: 'DKI Jakarta' } });

  // 2. Seed Cabang
  if (jabar) {
    const cabangJabar = ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi'];
    for (const nama of cabangJabar) {
      const existing = await prisma.cabang.findFirst({ where: { nama_cabang: nama, wilayah_id: jabar.id } });
      if (!existing) {
        await prisma.cabang.create({ data: { nama_cabang: nama, wilayah_id: jabar.id } });
      }
    }
  }

  if (dki) {
    const cabangDki = ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'];
    for (const nama of cabangDki) {
      const existing = await prisma.cabang.findFirst({ where: { nama_cabang: nama, wilayah_id: dki.id } });
      if (!existing) {
        await prisma.cabang.create({ data: { nama_cabang: nama, wilayah_id: dki.id } });
      }
    }
  }
  console.log('✅ Cabang seeded.');

  // 3. Seed Departments (Jurusan)
  const departments = [
    'Pendidikan Agama & Keagamaan',
    'Manajemen Lembaga',
    'Teknologi Informasi & Komunikasi',
    'Administrasi & Keuangan',
    'Kurikulum & Standar Mutu',
  ];

  for (const nama of departments) {
    const existing = await prisma.department.findFirst({ where: { nama_jurusan: nama } });
    if (!existing) {
      await prisma.department.create({ data: { nama_jurusan: nama } });
    }
  }
  console.log('✅ Departments seeded.');

  // 4. Seed Superadmin User
  const adminEmail = 'admin@lms.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        nama: 'Super Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: Role.superadmin,
        two_factor_enabled: false,
      },
    });
    console.log(`✅ Superadmin created: ${adminEmail} / admin123`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  }

  const hashedStudentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'siswa@lms.com' },
    update: { nama: 'Siswa Demo', role: Role.siswa, password: hashedStudentPassword },
    create: { nama: 'Siswa Demo', email: 'siswa@lms.com', password: hashedStudentPassword, role: Role.siswa },
  });
  const instructor = await prisma.user.upsert({
    where: { email: 'instruktur@lms.com' },
    update: { nama: 'Instruktur Demo', role: Role.instruktur, password: hashedStudentPassword },
    create: { nama: 'Instruktur Demo', email: 'instruktur@lms.com', password: hashedStudentPassword, role: Role.instruktur },
  });
  console.log('✅ Demo student and instructor ready.');

  const courseTitles = [
    'Dasar-Dasar Desain Visual',
    'Pengantar Manajemen Lembaga',
    'Strategi Pembelajaran Digital',
    'Administrasi Keuangan Praktis',
    'Kurikulum dan Standar Mutu',
    'Komunikasi Profesional',
    'Teknologi Informasi untuk Pendidikan',
    'Kepemimpinan Organisasi',
    'Evaluasi Program Pembelajaran',
    'Proyek Akhir LMS',
  ];

  for (const [index, title] of courseTitles.entries()) {
    const course = await prisma.course.upsert({
      where: { id: 900 + index },
      update: { judul: title, deskripsi: `Materi terintegrasi untuk ${title}.`, nama_instruktur: instructor.nama, instruktur_id: instructor.id, start_date: new Date('2026-10-01'), end_date: new Date('2026-12-31') },
      create: { id: 900 + index, judul: title, deskripsi: `Materi terintegrasi untuk ${title}.`, nama_instruktur: instructor.nama, instruktur_id: instructor.id, start_date: new Date('2026-10-01'), end_date: new Date('2026-12-31') },
    });

    const materialTitles = ['Orientasi dan Tujuan', 'Materi Inti', 'Latihan Terapan'];
    for (const [materialIndex, materialTitle] of materialTitles.entries()) {
      const materialType = materialIndex === 0 ? 'pdf' : 'gdrive_video';
      const existingMaterial = await prisma.material.findFirst({ where: { course_id: course.id, urutan: materialIndex + 1 } });
      if (existingMaterial) {
        await prisma.material.update({ where: { id: existingMaterial.id }, data: { judul: `${materialTitle} - ${title}`, tipe: materialType, video_url: materialType === 'gdrive_video' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null, file_path: materialType === 'pdf' ? '/uploads/demo-handout.pdf' : null, duration_minutes: 20 + materialIndex * 15 } });
      } else {
        await prisma.material.create({ data: { course_id: course.id, judul: `${materialTitle} - ${title}`, deskripsi: `Bagian ${materialIndex + 1} dari ${title}.`, tipe: materialType, video_url: materialType === 'gdrive_video' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined, file_path: materialType === 'pdf' ? '/uploads/demo-handout.pdf' : undefined, duration_minutes: 20 + materialIndex * 15, urutan: materialIndex + 1 } });
      }
    }

    const enrollment = await prisma.enrollment.findFirst({ where: { user_id: student.id, course_id: course.id } });
    if (!enrollment) await prisma.enrollment.create({ data: { user_id: student.id, course_id: course.id, status: 'active', progress: (index + 1) * 7 % 100, last_accessed: new Date() } });

    const event = await prisma.jadwalKursus.findFirst({ where: { course_id: course.id, judul: `Sesi ${title}` } });
    if (!event) await prisma.jadwalKursus.create({ data: { course_id: course.id, judul: `Sesi ${title}`, deskripsi: 'Sesi pembelajaran bersama instruktur.', tipe: 'live_session', waktu_mulai: new Date(`2026-10-${String((index % 20) + 1).padStart(2, '0')}T09:00:00Z`), waktu_selesai: new Date(`2026-10-${String((index % 20) + 1).padStart(2, '0')}T10:30:00Z`) } });

    const topic = await prisma.topikDiskusi.findFirst({ where: { course_id: course.id, judul: `Diskusi ${title}` } });
    if (!topic) await prisma.topikDiskusi.create({ data: { course_id: course.id, user_id: instructor.id, judul: `Diskusi ${title}`, isi: 'Bagikan pertanyaan dan refleksi Anda tentang materi kursus ini.' } });
  }
  console.log('✅ 10 public courses with materials, enrollments, schedules, and discussions seeded.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
