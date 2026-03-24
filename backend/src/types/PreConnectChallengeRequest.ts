export enum FrameType {
  REQUEST = 'req',
  RESPONSE = 'res',
  EVENT = 'event',
}

export interface PreconnectChallengeRequest {
  type: string;
  event: string;
  payload: { nonce: string; ts: number };
}

export type RequestFrame = {
  type: FrameType.REQUEST;
  id: string;
  ok: boolean;
  payload?: unknown;
};

export type ResponseFrame = {
  type: FrameType.RESPONSE;
  id: string;
  ok: boolean;
  payload?: unknown;
};

export type EventFrame = {
  type: FrameType.EVENT;
  event: string;
  payload?: unknown;
};

export type GatewayFrame = RequestFrame | ResponseFrame | EventFrame;

export type ConnectionChallengePayload = {
  nonce: string;
  ts: number;
};
