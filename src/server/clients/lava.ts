import { Lava } from "@lavapayments/nodejs";
import { env } from "~/env";

export const lava = new Lava(env.LAVA_SECRET_KEY, {
  apiVersion: "2025-03-27.v1",
});
