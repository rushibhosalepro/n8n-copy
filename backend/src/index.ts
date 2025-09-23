import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { generate } from "short-uuid";
import streamToString from "stream-to-string";
import type WebSocket from "ws";
import { WebSocketServer } from "ws";
import { config } from "./config/env";
import { prisma } from "./lib/prisma";
import { r2 } from "./lib/s3";

import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
// create new workflow
app.get("/create", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const baseName = "My Workflow";
    const wf = await prisma.workflow.create({
      data: {
        name: baseName,
        active: false,
        objectKey: "",
        userId,
      },
    });
    res.json({ projectId: wf.id });
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
});
app.get("/workflow/:projectId", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    console.log(userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { projectId } = req.params;

    const wf = await prisma.workflow.findUnique({
      where: { id: projectId, userId },
    });

    if (!wf) return res.status(404).json({ error: "Workflow not found" });

    let workflowData = null;

    if (wf.objectKey) {
      try {
        const s3Object = await r2.send(
          new GetObjectCommand({
            Bucket: "workflows",
            Key: wf.objectKey,
          })
        );

        const bodyString = await streamToString(s3Object.Body as any);
        workflowData = JSON.parse(bodyString);
      } catch (err) {
        console.error("Failed to fetch workflow JSON from S3:", err);
        workflowData = null;
      }
    }

    return res.json({ wf, workflowData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/workflows", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const wfs = await prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        active: true,
        updatedAt: true,
      },
      where: { userId },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return res.json(wfs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/workflow/:projectId", async (req, res) => {
  const userId = req.cookies?.token
    ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
        .userId
    : null;

  console.log(userId);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { projectId } = req.params;
  const { active, name, nodes, connections } = req.body;

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: projectId, userId },
    });

    if (!workflow) return res.status(404).json({ error: "Workflow not found" });
    console.log(workflow);

    let objectKey = workflow.objectKey;

    const data: { active?: boolean; name?: string; objectKey?: string } = {};

    if (nodes && connections) {
      if (!objectKey) {
        objectKey = `workflows/${projectId}/${generate()}.json`;
      }

      const body = JSON.stringify({ nodes, connections });

      await r2.send(
        new PutObjectCommand({
          Bucket: "workflows",
          Key: objectKey,
          Body: body,
          ContentType: "application/json",
        })
      );

      data.objectKey = objectKey;
    }

    if (typeof active === "boolean") data.active = active;
    if (typeof name === "string" && name.trim() !== "") data.name = name.trim();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: projectId, userId },
      data,
    });

    return res.json(updatedWorkflow);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// google oauth
app.get("/auth/google", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: config.google_redirect_uri,
    client_id: config.google_client_id,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"].join(" "),
  };

  const qs = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${qs}`);
});

app.get("/auth/google/callback", async (req, res) => {
  const userId = req.cookies?.token
    ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
        .userId
    : null;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: config.google_client_id,
      client_secret: config.google_client_secret,
      redirect_uri: config.google_redirect_uri,
      grant_type: "authorization_code",
    });

    console.log("Tokens:", data);

    const credential = await prisma.credential.create({
      data: {
        name: "My Gmail Account",
        type: "GmailNode",
        data: data,
        userId,
      },
    });
    res.send("Gmail connected! You can close this window.");
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).send("OAuth error");
  }
});

// save cred
app.post("/credentials", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { name, type, data } = req.body;

    if (!name || !type || !data) {
      return res
        .status(400)
        .json({ error: "name, type and data are required" });
    }

    const credential = await prisma.credential.create({
      data: { name, type, data, userId },
    });

    res.json({ id: credential.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create credential" });
  }
});

app.get("/credentials", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const creds = await prisma.credential.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
      where: { userId },
    });
    res.json(creds);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to list credentials" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt_secret,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,

      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({ message: "User registered successfully" });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signIn", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt_secret,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,

      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ message: "Login successful" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// executors
const webhookResults: Record<string, any> = {};
const listeners: Map<string, { data: any; sockets: Set<WebSocket> }> =
  new Map();
app.all("/webook-test/:webhookId", async (req, res) => {
  const { webhookId } = req.params;

  const payload = {
    id: webhookId,
    timestamp: new Date(),
    query: req.query,
    body: req.body,
    headers: req.headers,
    method: req.method,
  };

  webhookResults[webhookId] = payload;

  if (listeners.has(webhookId)) {
    listeners.get(webhookId)!.sockets.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({ type: "webhook_event", payload }));
      }
    });
  }

  res.json({ msg: "workflow" });
});

app.post("/run", async (req, res) => {
  try {
    const { nodeData, httpMethod, path, auth, webhookId } = req.body;

    // if (!webhookId) {
    //   return res.status(400).json({ error: "webhookId is required" });
    // }

    // if (!listeners.has(webhookId)) {
    //   listeners.set(webhookId, { data: null, sockets: new Set() });
    // }
    // listeners.get(webhookId)!.data = { nodeData, httpMethod, path, auth };

    // listeners.get(webhookId)!.sockets.forEach((socket) => {
    //   socket.send(JSON.stringify({ type: "ready", payload: { webhookId } }));
    // });

    res.json({ msg: "Webhook listener is ready", webhookId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// create sockets
wss.on("connection", (ws) => {
  ws.on("message", (msg: string) => {
    const data = JSON.parse(msg);
    switch (data.type) {
      case "subscribe": {
        const webhookId: string = data.webhookId;
        if (!listeners.has(webhookId)) {
          listeners.set(webhookId, { data: null, sockets: new Set() });
        }
        listeners.get(webhookId)!.sockets.add(ws);

        break;
      }
    }
  });
});

// starts server
server.listen(config.port, () =>
  console.log(`server running at http://localhost:${config.port}`)
);
