import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Role } from './../src/common/enums/role.enum';
import { PrismaService } from './../src/prisma/prisma.service';

jest.setTimeout(60000);

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Use direct DB connection in e2e to avoid PgBouncer prepared statement issues.
    if (process.env.DIRECT_URL) {
      process.env.DATABASE_URL = process.env.DIRECT_URL;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  const uniqueEmail = (prefix: string) =>
    `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@fitlink.test`;

  const registerUser = async (role?: Role) => {
    const payload: { email: string; password: string; role?: Role } = {
      email: uniqueEmail(role?.toLowerCase() ?? 'user'),
      password: '123456',
    };

    if (role) {
      payload.role = role;
    }

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    return {
      ...payload,
      accessToken: response.body.accessToken as string,
    };
  };

  const getMe = async (accessToken: string) => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    return response.body as { id: string; email: string; role: Role };
  };

  const createDbUser = async (role: Role = Role.USER) => {
    return prisma.user.create({
      data: {
        email: uniqueEmail('seed'),
        passwordHash: 'seed-hash',
        role: role as any,
      },
    });
  };

  const createWorkoutPlanSeed = async () => {
    const trainerUser = await createDbUser(Role.TRAINER);
    const traineeUser = await createDbUser(Role.USER);

    const trainer = await prisma.trainer.create({
      data: {
        userId: trainerUser.id,
        certifications: [],
      },
    });

    return prisma.workoutPlan.create({
      data: {
        trainerId: trainer.id,
        userId: traineeUser.id,
        title: 'Seed workout',
      },
    });
  };

  const createDietPlanSeed = async () => {
    const nutritionistUser = await createDbUser(Role.NUTRITIONIST);
    const targetUser = await createDbUser(Role.USER);

    const nutritionist = await prisma.nutritionist.create({
      data: {
        userId: nutritionistUser.id,
        certifications: [],
      },
    });

    return prisma.dietPlan.create({
      data: {
        nutritionistId: nutritionist.id,
        userId: targetUser.id,
        title: 'Seed diet',
      },
    });
  };

  const createProgressSeed = async () => {
    const user = await createDbUser(Role.USER);

    return prisma.bodyMetric.create({
      data: {
        userId: user.id,
        notes: 'seed',
      },
    });
  };

  const createSubscriptionSeed = async () => {
    const user = await createDbUser(Role.USER);
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return prisma.subscription.create({
      data: {
        userId: user.id,
        planName: 'Starter',
        status: 'TRIALING',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    });
  };

  it('GET /workouts returns list', async () => {
    const response = await request(app.getHttpServer()).get('/workouts').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /workouts/:id updates workout', async () => {
    const workout = await createWorkoutPlanSeed();

    const response = await request(app.getHttpServer())
      .put(`/workouts/${workout.id}`)
      .send({ title: 'Upper Body A', isActive: false })
      .expect(200);

    expect(response.body.id).toBe(workout.id);
    expect(response.body.title).toBe('Upper Body A');
    expect(response.body.isActive).toBe(false);
  });

  it('PUT /workouts/:id validates payload', async () => {
    await request(app.getHttpServer())
      .put('/workouts/00000000-0000-0000-0000-000000000001')
      .send({})
      .expect(400);
  });

  it('GET /diets returns list', async () => {
    const response = await request(app.getHttpServer()).get('/diets').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /diets/:id updates diet', async () => {
    const diet = await createDietPlanSeed();

    const response = await request(app.getHttpServer())
      .put(`/diets/${diet.id}`)
      .send({ title: 'Cutting Plan', dailyCalories: 2200 })
      .expect(200);

    expect(response.body.id).toBe(diet.id);
    expect(response.body.title).toBe('Cutting Plan');
    expect(response.body.dailyCalories).toBe(2200);
  });

  it('PUT /diets/:id validates payload', async () => {
    await request(app.getHttpServer())
      .put('/diets/00000000-0000-0000-0000-000000000002')
      .send({})
      .expect(400);
  });

  it('GET /progress returns list', async () => {
    const response = await request(app.getHttpServer()).get('/progress').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /progress/:id updates progress', async () => {
    const metric = await createProgressSeed();

    const response = await request(app.getHttpServer())
      .put(`/progress/${metric.id}`)
      .send({ weightKg: 82.5, notes: 'good week' })
      .expect(200);

    expect(response.body.id).toBe(metric.id);
    expect(Number(response.body.weightKg)).toBe(82.5);
    expect(response.body.notes).toBe('good week');
  });

  it('PUT /progress/:id validates payload', async () => {
    await request(app.getHttpServer())
      .put('/progress/00000000-0000-0000-0000-000000000003')
      .send({})
      .expect(400);
  });

  it('GET /subscriptions returns list', async () => {
    const response = await request(app.getHttpServer())
      .get('/subscriptions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /subscriptions/:id updates subscription', async () => {
    const subscription = await createSubscriptionSeed();

    const response = await request(app.getHttpServer())
      .put(`/subscriptions/${subscription.id}`)
      .send({ planName: 'Pro', status: 'ACTIVE' })
      .expect(200);

    expect(response.body.id).toBe(subscription.id);
    expect(response.body.planName).toBe('Pro');
    expect(response.body.status).toBe('ACTIVE');
  });

  it('PUT /subscriptions/:id validates payload', async () => {
    await request(app.getHttpServer())
      .put('/subscriptions/00000000-0000-0000-0000-000000000004')
      .send({})
      .expect(400);
  });

  it('POST /auth/register returns access token', async () => {
    const payload = {
      email: uniqueEmail('register'),
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.accessToken.length).toBeGreaterThan(10);
  });

  it('POST /auth/register validates payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invalid-email', password: '123' })
      .expect(400);

    expect(Array.isArray(response.body.message)).toBe(true);
  });

  it('POST /auth/register fails for duplicate email', async () => {
    const payload = {
      email: uniqueEmail('duplicate'),
      password: '123456',
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400);

    expect(duplicateResponse.body.message).toBe('E-mail already in use');
  });

  it('POST /auth/login returns access token for valid credentials', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
  });

  it('POST /auth/login validates payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad', password: '123' })
      .expect(400);

    expect(Array.isArray(response.body.message)).toBe(true);
  });

  it('POST /auth/login fails for invalid password', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrong-pass' })
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials');
  });

  it('GET /users/me requires token', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('GET /users/me returns authenticated user', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(user.email);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('role', 'USER');
  });

  it('PUT /users/me requires token', async () => {
    await request(app.getHttpServer())
      .put('/users/me')
      .send({ email: uniqueEmail('unauthorized') })
      .expect(401);
  });

  it('PUT /users/me updates email', async () => {
    const user = await registerUser();
    const newEmail = uniqueEmail('updated');

    const response = await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ email: newEmail })
      .expect(200);

    expect(response.body.email).toBe(newEmail);
  });

  it('PUT /users/me updates password and allows login with new password', async () => {
    const user = await registerUser();
    const newPassword = '654321';

    await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ password: newPassword })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(401);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: newPassword })
      .expect(200);

    expect(typeof loginResponse.body.accessToken).toBe('string');
  });

  it('PUT /users/me validates payload', async () => {
    const user = await registerUser();

    await request(app.getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({})
      .expect(400);
  });

  it('GET /users/admin denies non-admin users', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .get('/users/admin')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);

    expect(response.body.message).toBe('Insufficient permissions');
  });

  it('GET /users/admin allows admin users', async () => {
    const admin = await registerUser(Role.ADMIN);

    const response = await request(app.getHttpServer())
      .get('/users/admin')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(response.body.message).toBe('Admin access granted');
  });

  it('GET /users requires token', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });

  it('GET /users denies non-admin users', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);

    expect(response.body.message).toBe('Insufficient permissions');
  });

  it('GET /users returns list for admin users', async () => {
    const admin = await registerUser(Role.ADMIN);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /users/:id/role requires admin role', async () => {
    const actor = await registerUser();
    const target = await registerUser();

    const targetMe = await getMe(target.accessToken);

    await request(app.getHttpServer())
      .put(`/users/${targetMe.id}/role`)
      .set('Authorization', `Bearer ${actor.accessToken}`)
      .send({ role: Role.TRAINER })
      .expect(403);
  });

  it('PUT /users/:id/role allows admin to update role', async () => {
    const admin = await registerUser(Role.ADMIN);
    const target = await registerUser();

    const targetMe = await getMe(target.accessToken);

    const updateResponse = await request(app.getHttpServer())
      .put(`/users/${targetMe.id}/role`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: Role.TRAINER })
      .expect(200);

    expect(updateResponse.body.role).toBe(Role.TRAINER);
  });

  it('GET /trainers/dashboard allows trainer role', async () => {
    const trainer = await registerUser(Role.TRAINER);

    const meResponse = await getMe(trainer.accessToken);

    const dashboardResponse = await request(app.getHttpServer())
      .get('/trainers/dashboard')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .expect(200);

    expect(dashboardResponse.body.message).toBe(
      `Trainer dashboard for user ${meResponse.id}`,
    );
  });

  it('PUT /trainers/profile allows trainer role', async () => {
    const trainer = await registerUser(Role.TRAINER);

    const response = await request(app.getHttpServer())
      .put('/trainers/profile')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ bio: 'CREF owner', yearsExperience: 4 })
      .expect(200);

    expect(response.body.bio).toBe('CREF owner');
    expect(response.body.yearsExperience).toBe(4);
  });

  it('PUT /trainers/profile denies user role', async () => {
    const user = await registerUser();

    await request(app.getHttpServer())
      .put('/trainers/profile')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ bio: 'x' })
      .expect(403);
  });

  it('GET /trainers/dashboard denies user role', async () => {
    const user = await registerUser();

    await request(app.getHttpServer())
      .get('/trainers/dashboard')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('GET /nutritionists/dashboard allows nutritionist role', async () => {
    const nutritionist = await registerUser(Role.NUTRITIONIST);

    const meResponse = await getMe(nutritionist.accessToken);

    const dashboardResponse = await request(app.getHttpServer())
      .get('/nutritionists/dashboard')
      .set('Authorization', `Bearer ${nutritionist.accessToken}`)
      .expect(200);

    expect(dashboardResponse.body.message).toBe(
      `Nutritionist dashboard for user ${meResponse.id}`,
    );
  });

  it('PUT /nutritionists/profile allows nutritionist role', async () => {
    const nutritionist = await registerUser(Role.NUTRITIONIST);

    const response = await request(app.getHttpServer())
      .put('/nutritionists/profile')
      .set('Authorization', `Bearer ${nutritionist.accessToken}`)
      .send({ bio: 'sports nutrition', yearsExperience: 7 })
      .expect(200);

    expect(response.body.bio).toBe('sports nutrition');
    expect(response.body.yearsExperience).toBe(7);
  });

  it('PUT /nutritionists/profile denies user role', async () => {
    const user = await registerUser();

    await request(app.getHttpServer())
      .put('/nutritionists/profile')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ bio: 'x' })
      .expect(403);
  });

  it('GET /nutritionists/dashboard denies user role', async () => {
    const user = await registerUser();

    const response = await request(app.getHttpServer())
      .get('/nutritionists/dashboard')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);

    expect(response.body.message).toBe('Insufficient permissions');
  });
  it('POST /auth/register accepts username and cpf and exposes them in /users/me', async () => {
    const payload = {
      email: uniqueEmail('register.identity'),
      password: '123456',
      username: `user_${Date.now()}`,
      cpf: '12345678901',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const meResponse = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(200);

    expect(meResponse.body.username).toBe(payload.username);
    expect(meResponse.body.cpf).toBe(payload.cpf);
  });

  it('GET /trainers/profile returns cref for trainer', async () => {
    const trainer = await registerUser(Role.TRAINER);

    await request(app.getHttpServer())
      .put('/trainers/profile')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ cref: 'SP-123456', bio: 'trainer profile' })
      .expect(200);

    const profileResponse = await request(app.getHttpServer())
      .get('/trainers/profile')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .expect(200);

    expect(profileResponse.body.cref).toBe('SP-123456');
  });

  it('GET /nutritionists/profile returns crn for nutritionist', async () => {
    const nutritionist = await registerUser(Role.NUTRITIONIST);

    await request(app.getHttpServer())
      .put('/nutritionists/profile')
      .set('Authorization', `Bearer ${nutritionist.accessToken}`)
      .send({ crn: 'CRN3-12345', bio: 'nutritionist profile' })
      .expect(200);

    const profileResponse = await request(app.getHttpServer())
      .get('/nutritionists/profile')
      .set('Authorization', `Bearer ${nutritionist.accessToken}`)
      .expect(200);

    expect(profileResponse.body.crn).toBe('CRN3-12345');
  });
});


