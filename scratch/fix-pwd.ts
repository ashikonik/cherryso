import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

try {
  let content = fs.readFileSync('.env.local', 'utf-8');
  const urlStr = process.env.DATABASE_URL!;
  const match = urlStr.match(/:\/\/[^:]+:([^@]+)@/);
  
  if (match) {
    const pwd = match[1];
    // If it's already encoded, decode first, otherwise it double encodes. But we checked it's not.
    if (pwd === decodeURIComponent(pwd)) {
      const encodedPwd = encodeURIComponent(pwd);
      const newUrlStr = urlStr.replace(`:${pwd}@`, `:${encodedPwd}@`);
      content = content.replace(urlStr, newUrlStr);
      fs.writeFileSync('.env.local', content, 'utf-8');
      console.log("Password successfully URL-encoded!");
    } else {
      console.log("Already encoded or something else.");
    }
  }
} catch (e) {
  console.error(e);
}
