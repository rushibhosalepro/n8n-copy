import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { generate } from "short-uuid";
import streamToString from "stream-to-string";
import { WebSocketServer } from "ws";
import { config } from "./config/env";
import { prisma } from "./lib/prisma";
import { r2 } from "./lib/s3";

import bcrypt from "bcrypt";

import { ExecutionManager } from "./execution";
import { formBuilder } from "./formBuilder";
import { getSingleNode } from "./lib";
import { ListenerManager } from "./listener";
import type { INode } from "./schema";

const app = express();
app.use(express.urlencoded({ extended: true }));
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

const listenerManager = new ListenerManager();
const executionManager = new ExecutionManager(listenerManager);
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

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { projectId } = req.params;
  const { active, name, nodes, connections } = req.body;

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: projectId, userId },
    });

    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

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
    scope: [
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
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
    const { data: userInfo } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );
    const credential = await prisma.credential.create({
      data: {
        name: "My Gmail Account",
        type: "GmailNode",
        data: {
          ...data,
          email: userInfo.email,
        },
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

app.get("/credential/:nodeType", async (req, res) => {
  try {
    const userId = req.cookies?.token
      ? (jwt.verify(req.cookies.token, config.jwt_secret) as { userId: string })
          .userId
      : null;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const nodeType = req.params.nodeType;
    const creds = await prisma.credential.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
      where: { userId, type: nodeType },
    });
    // console.log(nodeType, creds);
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

interface SplatParams {
  splat: string;
}
app.all("/webhook-test/*url", async (req, res) => {
  try {
    const params = req.params as { url: string[] };
    const webhookId = params.url.join("/");

    if (!webhookId || !listenerManager.hasListener(webhookId)) {
      return res.status(404).json({ error: "Webhook not registered" });
    }

    const node = listenerManager.getNode(webhookId);

    if (!node) {
      return res.status(404).json({ error: "Webhook node not found" });
    }

    const httpMethod = node.parameters?.httpMethod ?? "GET";
    const path = node.parameters?.path ?? webhookId;

    if (req.method !== httpMethod) {
      return res.status(405).json({
        error: `Invalid HTTP method. Expected ${httpMethod}, got ${req.method}`,
      });
    }

    if (path !== webhookId) {
      return res.status(400).json({ error: "URL not matching node path" });
    }

    const payload = {
      id: node.webhookId,
      timestamp: new Date(),
      query: req.query,
      body: req.body,
      headers: req.headers,
      method: req.method,
      webhookUrl: `${config.url}:${config.port}/webhook-test/${webhookId}`,
    };

    // listenerManager.emit(webhookId, { type: "webhook_event", payload });

    await executionManager.executeWf(webhookId, payload);

    // listenerManager.emit(webhookId, { type: "execution_completed", payload });

    // listenerManager.removeListener(webhookId);

    res.json({ msg: "Webhook received and workflow executed" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/run", (req, res) => {
  const payload = req.body;
  if (!payload || !payload.workflowData) {
    return res.status(400).json({ error: "workflowData is required" });
  }

  const triggerNodes: INode[] = payload.startNodes.map((nodeId: string) =>
    getSingleNode(payload.workflowData, nodeId)
  );

  if (triggerNodes.length === 0) {
    return res.status(404).json({ error: "No valid start nodes found" });
  }

  triggerNodes.forEach((node: INode) => {
    listenerManager.addListener(node);
    executionManager.registerWf(node.webhookId, payload);
  });

  res.json({ message: "ready to execute" });
});

app.get("/form-test/:webhookId", async (req, res) => {
  const webhookId = req.params.webhookId;

  if (!webhookId || !listenerManager.hasListener(webhookId)) {
    return res.status(404).json({ error: "Webhook not registered" });
  }

  const node = listenerManager.getNode(webhookId);

  if (!node) {
    return res.status(404).json({ error: "Webhook node not found" });
  }

  res.setHeader("Content-Type", "text/html");
  res.send(
    formBuilder({
      webhookId: webhookId,
      formTitle: node.parameters.formTitle ?? "",
      formDescription: node.parameters.formDescription ?? "",
      formFields: node.parameters.formFields ?? [],
    })
  );
});
app.post("/:webhookId", async (req, res) => {
  const webhookId = req.params.webhookId;
  const data = await req.body;
  if (!webhookId || !listenerManager.hasListener(webhookId)) {
    return res.status(404).json({ error: "Webhook not registered" });
  }

  await executionManager.executeWf(webhookId, data);

  res.json({ msg: "Webhook received and workflow executed" });
});

// create sockets
wss.on("connection", (ws) => {
  ws.on("message", (msg: string) => {
    try {
      const data = JSON.parse(msg);
      const webhookId: string = data.webhookId;

      switch (data.type) {
        case "subscribe": {
          listenerManager.participate(webhookId, ws);
          break;
        }
        case "unsubscribe": {
          listenerManager.removeListener(webhookId);
        }
      }
    } catch (err) {
      console.error("Invalid WS message:", err);
    }
  });
});

// starts server
server.listen(config.port, () =>
  console.log(`server running at http://localhost:${config.port}`)
);
