import { PlatformInfo } from "../types";

export const PLATFORMS: Record<string, PlatformInfo> = {
  vercel: {
    id: "vercel",
    name: "Vercel",
    description: "Serverless platform optimized for frontend frameworks like Next.js.",
    url: "https://vercel.com",
    icon: "vercel", // Will be mapped to an actual icon component
    category: "serverless",
  },
  netlify: {
    id: "netlify",
    name: "Netlify",
    description: "Serverless platform for web applications and static websites.",
    url: "https://netlify.com",
    icon: "netlify",
    category: "serverless",
  },
  cloudflare: {
    id: "cloudflare",
    name: "Cloudflare Workers",
    description: "Edge serverless platform using V8 isolates.",
    url: "https://workers.cloudflare.com",
    icon: "cloudflare",
    category: "serverless",
  },
  railway: {
    id: "railway",
    name: "Railway",
    description: "Infrastructure platform where you can provision infrastructure, develop with it locally, and then deploy it to the cloud.",
    url: "https://railway.app",
    icon: "railway",
    category: "paas",
  },
  render: {
    id: "render",
    name: "Render",
    description: "Unified cloud to build and run all your apps and websites with free TLS certificates, global CDN, private networks and auto deploys from Git.",
    url: "https://render.com",
    icon: "render",
    category: "paas",
  },
  flyio: {
    id: "flyio",
    name: "Fly.io",
    description: "Deploy app servers close to your users.",
    url: "https://fly.io",
    icon: "flyio",
    category: "paas",
  },
  docker: {
    id: "docker",
    name: "Generic VPS / Docker",
    description: "Any Virtual Private Server (DigitalOcean, Linode, AWS EC2, etc.) or container-based environment.",
    url: "https://www.docker.com/",
    icon: "docker",
    category: "vps",
  },
};
