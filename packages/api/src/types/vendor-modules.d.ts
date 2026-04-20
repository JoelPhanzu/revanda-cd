declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
  }

  export interface JwtPayload {
    [key: string]: unknown;
    sub?: string;
  }

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string): string | JwtPayload;
}
