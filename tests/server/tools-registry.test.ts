import { describe, it, expect, afterEach } from "vitest";
import { loadConfig } from "../../src/config.js";
import { buildServer } from "../../src/server.js";

const silentLog = { error() {}, warn() {}, info() {}, debug() {} };

function setEnv(vars: Record<string, string>) {
  Object.assign(process.env, {
    PROTON_MAIL_ENABLED: "false",
    PROTON_PASS_ENABLED: "false",
    PROTON_CALENDAR_ENABLED: "false",
    PROTON_DRIVE_ENABLED: "false",
    ALERTS_ENABLED: "false",
    PROTON_BRIDGE_USER: "test@example.com",
    PROTON_BRIDGE_PASS: "test-pass",
    PROTON_MAIL_FROM: "test@example.com",
    ...vars,
  });
}

function cleanEnv() {
  for (const k of [
    "PROTON_PASS_ENABLED",
    "PROTON_PASS_STORE_DIR",
    "PROTON_CALENDAR_ENABLED",
    "PROTON_DRIVE_ENABLED",
    "DRIVE_STAGING_DIR",
  ]) {
    delete process.env[k];
  }
}

describe("MCP tools registry", () => {
  afterEach(cleanEnv);

  it("buildServer completes without throwing with default config", () => {
    setEnv({});
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });

  it("buildServer completes with Pass enabled", () => {
    setEnv({
      PROTON_PASS_ENABLED: "true",
      PROTON_PASS_STORE_DIR: "/tmp/test-pass",
    });
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });

  it("buildServer completes with Pass disabled", () => {
    setEnv({ PROTON_PASS_ENABLED: "false" });
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });

  it("buildServer completes with Calendar enabled", () => {
    setEnv({ PROTON_CALENDAR_ENABLED: "true" });
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });

  it("buildServer completes with Drive enabled", () => {
    setEnv({
      PROTON_DRIVE_ENABLED: "true",
      DRIVE_STAGING_DIR: "/tmp/test-staging",
    });
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });

  it("buildServer completes with all products disabled", () => {
    setEnv({});
    const cfg = loadConfig();
    const { server } = buildServer(cfg, silentLog);
    expect(server).toBeDefined();
  });
});
