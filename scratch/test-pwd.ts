import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

try {
  const urlStr = process.env.DATABASE_URL!;
  console.log("String starts with:", urlStr.substring(0, 15));
  // Find password part manually: postgresql://user:password@host...
  const match = urlStr.match(/:\/\/[^:]+:([^@]+)@/);
  if (match) {
    const pwd = match[1];
    const encoded = encodeURIComponent(pwd);
    if (pwd !== encoded && pwd === decodeURIComponent(pwd)) {
      console.log("SPECIAL_CHARS_NOT_ENCODED");
    } else {
      console.log("PASSWORD_OK_OR_ENCODED");
    }
  }
} catch (e) {
  console.error(e);
}
