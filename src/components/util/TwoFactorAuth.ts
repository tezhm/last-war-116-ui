import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import crypto from "crypto";

export class TwoFactorAuth {
    private static instance: TwoFactorAuth|null = null;

    public static getInstance(): TwoFactorAuth {
        if (TwoFactorAuth.instance === null) {
            TwoFactorAuth.instance = new TwoFactorAuth();
        }

        return TwoFactorAuth.instance;
    }

    public async generateOtpAuth(username: string): Promise<string> {
        const buffer = await this.randomBytes(14);
        const secret = base32Encode(buffer, "RFC4648", { padding: false });
        const account = encodeURI(username);
        const issuer = encodeURI("www.lastwar116.com");
        const otpType = "totp";
        const algorithm = "SHA1";
        const digits = 6;
        const period = 30;
        return `otpauth://${otpType}/${issuer}:${account}?algorithm=${algorithm}&digits=${digits}&period=${period}&issuer=${issuer}&secret=${secret}`;
    }

    public verifyTotp(token: string, otpAuthCode: string, window: number = 1): boolean {
        const parts = otpAuthCode.split("&secret=");

        if (parts.length !== 2) {
            return false;
        }

        for (let errorWindow = -window; errorWindow <= +window; errorWindow++) {
            const totp = this.generateTotp(parts[1], errorWindow);

            if (token === totp) {
                return true;
            }
        }

        return false;
    }

    private generateTotp(secret: string, window = 0): string {
        const counter = Math.floor(Date.now() / 30000);
        return this.generateHotp(secret, counter + window);
    }

    private generateHotp(secret: string, counter: number): string {
        const decodedSecret = base32Decode(secret, "RFC4648");
        const buffer = Buffer.alloc(8);

        for (let i = 0; i < 8; i++) {
            buffer[7 - i] = counter & 0xff;
            counter = counter >> 8;
        }

        // Step 1: Generate an HMAC-SHA-1 value
        const hmac = crypto.createHmac("sha1", Buffer.from(decodedSecret));
        hmac.update(buffer);
        const hmacResult = hmac.digest();

        // Step 2: Generate a 4-byte string (Dynamic Truncation)
        const offset = hmacResult[hmacResult.length - 1] & 0xf;
        const code =
            ((hmacResult[offset] & 0x7f) << 24) |
            ((hmacResult[offset + 1] & 0xff) << 16) |
            ((hmacResult[offset + 2] & 0xff) << 8) |
            (hmacResult[offset + 3] & 0xff);

        // Step 3: Compute an HOTP value
        return `${code % 10 ** 6}`.padStart(6, "0");
    }

    private async randomBytes(size: number): Promise<Buffer> {
        return new Promise((res, rej) => {
            crypto.randomBytes(size, (err, buf) => {
                if (err) {
                    return rej(err);
                }

                res(buf);
            });
        });
    }
}
