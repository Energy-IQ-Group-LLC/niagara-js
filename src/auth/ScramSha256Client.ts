import crypto from 'crypto';

export class ScramSha256Client {
  private username: string;
  private password: string;

  private clientNonce!: string;
  private serverNonce!: string;
  private salt!: Buffer;
  private iterations!: number;

  private clientFirstMessageBare!: string;
  private clientFinalMessageWithoutProof!: string;
  private authMessage!: string;
  private saltedPassword!: Buffer;

  constructor(username: string, password: string) {
    this.username = this.saslPrep(username);
    this.password = password.normalize('NFKC');
  }

  /** ---- STEP 1 ---- */
  createClientFirstMessage(): string {
    this.clientNonce = crypto.randomBytes(16).toString('base64');
    this.clientFirstMessageBare = `n=${this.username},r=${this.clientNonce}`;
    return `n,,${this.clientFirstMessageBare}`;
  }

  /** ---- STEP 2 ---- */
  createClientFinalMessage(serverFirstMessage: string): string {
    const attrs = this.parseAttrs(serverFirstMessage);

    this.iterations = Number(attrs.i);
    this.salt = Buffer.from(attrs.s, 'base64');

    // verify nonce prefix
    if (!attrs.r.startsWith(this.clientNonce)) {
      throw new Error('Client nonce mismatch');
    }

    this.serverNonce = attrs.r.substring(this.clientNonce.length);

    this.clientFinalMessageWithoutProof = `c=biws,r=${this.clientNonce}${this.serverNonce}`;

    this.authMessage = `${this.clientFirstMessageBare},${serverFirstMessage},${this.clientFinalMessageWithoutProof}`;

    this.saltedPassword = crypto.pbkdf2Sync(this.password, this.salt, this.iterations, 32, 'sha256');

    const clientKey = this.hmac(this.saltedPassword, 'Client Key');
    const storedKey = this.sha256(clientKey);
    const clientSignature = this.hmac(storedKey, this.authMessage);
    const clientProof = this.xor(clientKey, clientSignature);

    this.password = null as any; // clear

    return `${this.clientFinalMessageWithoutProof},p=${clientProof.toString('base64')}`;
  }

  /** ---- STEP 3 ---- */
  verifyServerFinalMessage(serverFinalMessage: string): void {
    const attrs = this.parseAttrs(serverFinalMessage);
    if (!attrs.v) throw new Error('Missing server signature');

    const serverKey = this.hmac(this.saltedPassword, 'Server Key');
    const expected = this.hmac(serverKey, this.authMessage).toString('base64');

    if (expected !== attrs.v) {
      throw new Error('Server signature mismatch');
    }
  }

  // ---------------- helpers ----------------

  private saslPrep(str: string): string {
    return str.normalize('NFKC').replace(/=/g, '=3D').replace(/,/g, '=2C');
  }

  private parseAttrs(msg: string): Record<string, string> {
    return Object.fromEntries(
      msg.split(',').map((p) => {
        const i = p.indexOf('=');
        return [p.slice(0, i), p.slice(i + 1)];
      })
    );
  }

  private hmac(key: Buffer, msg: string): Buffer {
    return crypto.createHmac('sha256', key).update(msg, 'utf8').digest();
  }

  private sha256(buf: Buffer): Buffer {
    return crypto.createHash('sha256').update(buf).digest();
  }

  private xor(a: Buffer, b: Buffer): Buffer {
    return Buffer.from(a.map((v, i) => v ^ b[i]));
  }
}
