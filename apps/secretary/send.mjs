// Zero-dependency Gmail sender — raw SMTP over implicit TLS (port 465, AUTH LOGIN).
// Keeps the whole app dependency-free (no nodemailer). Needs a Gmail App
// Password (accounts with 2FA on): https://myaccount.google.com/apppasswords
//
// ⚠️ UNTESTED end-to-end until real credentials are supplied — the protocol
// flow is standard Gmail SMTP, but verify the first real send.

import tls from "node:tls";

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

// send one line, resolve with the server's reply once a complete response
// (3-digit code + space terminator) has arrived; reject on unexpected code.
function converse(socket, line, expect) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const onData = (d) => {
      buf += d.toString("utf8");
      // a final SMTP line looks like "250 message" (space after code);
      // continuation lines look like "250-message"
      const last = buf.trimEnd().split("\n").pop();
      if (/^\d{3} /.test(last)) {
        socket.removeListener("data", onData);
        const code = parseInt(last, 10);
        if (expect && !expect.includes(code)) reject(new Error(`SMTP ${code}: ${last} (after: ${line || "connect"})`));
        else resolve(code);
      }
    };
    socket.on("data", onData);
    if (line !== null) socket.write(line + "\r\n");
  });
}

export function sendMail({ user, pass, to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" }, async () => {
      try {
        await converse(socket, null, [220]);
        await converse(socket, "EHLO leebrian.dev", [250]);
        await converse(socket, "AUTH LOGIN", [334]);
        await converse(socket, b64(user), [334]);
        await converse(socket, b64(pass), [235]);
        await converse(socket, `MAIL FROM:<${user}>`, [250]);
        await converse(socket, `RCPT TO:<${to}>`, [250, 251]);
        await converse(socket, "DATA", [354]);
        const boundary = "careeros_" + Date.now().toString(36);
        const headers = [
          `From: CareerOS Secretary <${user}>`,
          `To: ${to}`,
          `Subject: ${subject}`,
          "MIME-Version: 1.0",
          html ? `Content-Type: multipart/alternative; boundary="${boundary}"` : "Content-Type: text/plain; charset=utf-8",
        ];
        let body;
        if (html) {
          body = [
            `--${boundary}`, "Content-Type: text/plain; charset=utf-8", "", text,
            `--${boundary}`, "Content-Type: text/html; charset=utf-8", "", html,
            `--${boundary}--`, "",
          ].join("\r\n");
        } else {
          body = text;
        }
        // dot-stuff lines beginning with "." per RFC 5321
        const safeBody = body.replace(/\r?\n/g, "\r\n").replace(/\r\n\./g, "\r\n..");
        await converse(socket, headers.join("\r\n") + "\r\n\r\n" + safeBody + "\r\n.", [250]);
        await converse(socket, "QUIT", [221]).catch(() => {});
        socket.end();
        resolve(true);
      } catch (e) {
        socket.end();
        reject(e);
      }
    });
    socket.on("error", reject);
    socket.setTimeout(20000, () => { socket.destroy(); reject(new Error("SMTP timeout")); });
  });
}
