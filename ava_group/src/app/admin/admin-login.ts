import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  if (username === adminUser && password === adminPass) {
    return res.status(200).json({ success: true, message: "Login successful" });
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
