import {
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

/**
 * End-to-end auth flow. Requires the local stack to be running:
 *   npm run db:up && npm run db:migrate
 * Run with: npm run test:e2e --workspace=api
 */
describe("Auth (e2e)", () => {
  let app: INestApplication;
  const email = `e2e-${Date.now()}@test.com`;
  const password = "Password123!";
  let refreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("registers a new user and returns a token pair", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password, name: "E2E User" })
      .expect(201);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.organization.plan).toBe("FREE");
    refreshToken = res.body.data.refreshToken;
  });

  it("rejects duplicate registration", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password, name: "E2E User" })
      .expect(409);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password })
      .expect(201);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects invalid credentials", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "wrong-password" })
      .expect(401);
  });

  it("rotates the refresh token", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken })
      .expect(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });
});
