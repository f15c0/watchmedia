"use client";

import type PusherType from "pusher-js";

let _client: PusherType | null = null;

export function getPusherClient(): PusherType {
  if (_client) return _client;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PusherLib = require("pusher-js");
  const PusherClass = PusherLib.default ?? PusherLib;
  _client = new PusherClass(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }) as PusherType;
  return _client;
}
