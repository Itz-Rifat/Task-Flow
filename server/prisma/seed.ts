import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // Clean existing data
  await prisma.tasks.deleteMany();
  await prisma.projects.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo Users
  const password_hash = await bcrypt.hash('123456', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Rifat Hasan',
      email: 'rifathasan1875@gmail.com',
      password_hash,
    },
  });

  const teamMember = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password_hash,
    },
  });

  console.log(`👤 Created Demo Users: ${demoUser.email} & ${teamMember.email} (Password: 123456)`);

  // Create Demo Projects
  const project1 = await prisma.projects.create({
    data: {
      title: 'TaskFlow Application Launch',
      description: 'Building high-performance Kanban & Project Management app with Next.js & Node.js',
      owner_id: demoUser.id,
    },
  });

  const project2 = await prisma.projects.create({
    data: {
      title: 'Mobile App Redesign',
      description: 'Revamping iOS and Android user interface with fluid micro-interactions',
      owner_id: demoUser.id,
    },
  });

  console.log(`📁 Created Demo Projects: "${project1.title}" & "${project2.title}"`);

  // Create Demo Tasks for Project 1
  await prisma.tasks.createMany({
    data: [
      {
        project_id: project1.id,
        title: 'Design Relational PostgreSQL Schema',
        description: 'Define Users, Projects, Tasks tables with proper FK constraints & indexes',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigned_to: demoUser.id,
        due_date: new Date(Date.now() + 86400000 * 2),
      },
      {
        project_id: project1.id,
        title: 'Build Express REST API Endpoints',
        description: 'Implement auth (bcrypt, JWT) and task/project CRUD handlers',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigned_to: demoUser.id,
        due_date: new Date(Date.now() + 86400000 * 3),
      },
      {
        project_id: project1.id,
        title: 'Develop Next.js Drag & Drop Board',
        description: 'Integrate @tanstack/react-query with optimistic updates for fluid column movements',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        assigned_to: teamMember.id,
        due_date: new Date(Date.now() + 86400000 * 4),
      },
      {
        project_id: project1.id,
        title: 'Real-time Task Search & Filtering',
        description: 'Add title search and priority dropdown filters without full page reloads',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigned_to: teamMember.id,
        due_date: new Date(Date.now() + 86400000 * 5),
      },
      {
        project_id: project1.id,
        title: 'API Documentation & Postman Export',
        description: 'Export structured Postman JSON collection for automated API testing',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        assigned_to: demoUser.id,
        due_date: new Date(Date.now() + 86400000 * 6),
      },
    ],
  });

  console.log('✅ Database seeded successfully with initial demo dataset!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
