/**
 * ====================================================================
 *                 BLUE KNIGHT VLESS TELEGRAM BOT — STANDALONE BUNDLE
 * ====================================================================
 * Brand: Blue Knight Net (https://t.me/BlueKnight_Net)
 * Sponsor: WhiteDNS (https://t.me/whitedns)
 * Telegram-only edition: no website or management panel.
 * Set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_IDS below in this file.
 * ====================================================================
 */

// ========== TELEGRAM BOT SETTINGS — EDIT THESE ==========
// توکن ربات را از BotFather اینجا قرار بده
const TELEGRAM_BOT_TOKEN = "379350111:AAFzP4Au6xE58ZMtDpOEVvDEPn91b-bbiNw";
// آیدی عددی ادمین‌ها را داخل آرایه قرار بده؛ مثال: [123456789, 987654321]
const TELEGRAM_ADMIN_IDS = [123648747];
// ========================================================

// ========== BLUE KNIGHT GATE — EDIT ME ==========
const BK_CONFIG = {
  brand: "Blue Knight Net",
  product: "Blue Knight Gate",
  nodePrefix: "",
  channelUrl: "https://t.me/BlueKnight_Net",
  sponsorName: "WhiteDNS",
  sponsorUrl: "https://t.me/whitedns",
  publicPort: parseInt(process.env.PORT || process.env.SERVER_PORT || '8080', 10) || 8080,
  panelPath: "knight",
  dataDirHint: "/data",
  uuid: "",
  panelToken: process.env.PANEL_TOKEN || "",
  domain: process.env.DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || "",
  forceHost: process.env.FORCE_HOST || "",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.SUB_BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : ""),
  subBase: process.env.SUB_BASE || "",
  forceHttps: process.env.FORCE_HTTPS === 'true' || !!process.env.RAILWAY_PUBLIC_DOMAIN || !!process.env.REPLIT_DEPLOYMENT,
  allowLocalHostLinks: false,
  sniHy2: "www.google.com",
  massProxyUrl: "https://www.gstatic.com",
  enable: {
    hysteria2: false,
    vlessWs: true,
    vlessWsTls: true,
    vlessHttpUpgrade: true,
    vmessHttpUpgrade: true,   // BK_PROTOCOLS_APPLIED
    trojanHttpUpgrade: true,
    vlessGrpc: true,          // h2c on the shared port (self-hosted only)
    vlessGrpcTls: true,       // TLS + ALPN h2 on the shared port (self-hosted only)
    trojanWs: true,
    trojanWsTls: true,
    trojanGrpcTls: false,     // shares ALPN h2 with VLESS-gRPC-TLS: only used when vlessGrpcTls is off
    vmessWsTls: true,
    vmessWs: true,
    vlessXhttp: true,         // needs Xray-core (downloaded automatically)
    ssWs: true,               // Shadowsocks over WebSocket (v2ray-plugin compatible, Xray-core)
    reality: false,
    shadowTlsVless: false,
    shadowsocks: false,
    wireguard: false,
    tuic: false,
    socks: false,
    httpProxy: false,
    argo: false
  },
  reality: {
    target: "www.microsoft.com",
    targetPort: 443,
    shortId: ""
  },
  shadowTls: {
    sni: "www.microsoft.com",
    password: ""
  },
  shadowsocks: {
    method: "aes-256-gcm",
    password: ""
  },
  wireguard: {
    port: 51820,
    serverIp: "10.66.66.1/24",
    clientIp: "10.66.66.2/32",
    mtu: 1420
  },
  tuic: {
    port: 8443,
    congestionController: "bbr"
  },
  argo: {
    domain: "",
    auth: "",
    localPort: 8001
  },
  singBoxVersion: "1.11.15",
  xrayVersion: "",
  cpuLimitPercent: null
};
// ===============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const express = require('express');
const axios = require('axios');
const zlib = require('zlib'); // BK_XHTTP_APPLIED
const tls = require('tls');
const http2 = require('http2');

// Web panel and embedded website assets removed.

// Console colors used by Logger (restored from the original source).
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  electric: '\x1b[38;5;39m',
  navy: '\x1b[38;5;25m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m'
};

class Logger {
  static quiet = false;

  static banner() {
    if (this.quiet) return;
    const shield = `
${ANSI.electric}${ANSI.bold}      /\\             ____  _             _  __      _       _     _     
     /  \\           |  _ \\| |           | |/ /     (_)     | |   | |    
    / /\\ \\          | |_) | |_   _  ___ | ' / _ __  _  __ _| |__ | |_   
   / /  \\ \\         |  _ <| | | | |/ _ \\|  < | '_ \\| |/ _\` | '_ \\| __|  
  / / /\\ \\ \\        | |_) | | |_| |  __/| . \\| | | | | (_| | | | | |_   
 / / /  \\ \\ \\       |____/|_|\\__,_|\\___||_|\\_\\_| |_|_|\\__, |_| |_|\\__|  
/_/ / /\\ \\ \\_\\                                         __/ |            
\\_\\/ /  \\ \\/_/         ${ANSI.white}One port. Many paths.${ANSI.electric}          |___/             
  \\/_/\\/\\_/            ${ANSI.dim}Stream Without Limits${ANSI.electric}
${ANSI.reset}`;
    console.log(shield);
    console.log(`${ANSI.cyan}================================================================${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.electric}  BLUE KNIGHT GATE ${ANSI.white}• Running on ${bkPlatformName()}${ANSI.reset}`);
    console.log(`${ANSI.dim}  Channel: Blue Knight Net (https://t.me/BlueKnight_Net)${ANSI.reset}`);
    console.log(`${ANSI.dim}  Sponsor: WhiteDNS (https://t.me/whitedns)${ANSI.reset}`);
    console.log(`${ANSI.cyan}================================================================${ANSI.reset}\n`);
  }

  static renewNotice() {}

  static info(msg) {
    if (!this.quiet) console.log(`${ANSI.cyan}[i] ${msg}${ANSI.reset}`);
  }

  static success(msg) {
    if (!this.quiet) console.log(`${ANSI.green}[OK] ${msg}${ANSI.reset}`);
  }

  static warn(msg) {
    if (!this.quiet) console.log(`${ANSI.yellow}[!] ${msg}${ANSI.reset}`);
  }

  static error(msg) {
    console.error(`${ANSI.red}[X] ${msg}${ANSI.reset}`);
  }

  static step(msg) {
    if (!this.quiet) console.log(`${ANSI.electric}==> ${msg}${ANSI.reset}`);
  }

  static item(label, val) {
    if (!this.quiet) {
      console.log(`  ${ANSI.cyan}${label.padEnd(18)}:${ANSI.reset} ${ANSI.white}${val}${ANSI.reset}`);
    }
  }

  static section(title) {
    if (!this.quiet) {
      console.log(`\n${ANSI.bold}${ANSI.electric}--- ${title} ---${ANSI.reset}`);
    }
  }
}

// --- Module: lib/config.js ---
// BK_FIX3_APPLIED
// BK_REPLIT_APPLIED
function bkOnReplit() {
  return !!(process.env.REPLIT_DEPLOYMENT || process.env.REPL_ID || process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN);
}
function bkOnRailway() {
  return !!(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PUBLIC_DOMAIN);
}
/** Replit / Railway: public edge terminates TLS on 443 and forwards plain HTTP to PORT. */
function bkOnEdgeHost() { return bkOnReplit() || bkOnRailway(); }
function bkPlatformName() { return bkOnReplit() ? 'Replit' : (bkOnRailway() ? 'Railway' : 'Self-hosted'); }
/** Published Replit app domain from REPLIT_DOMAINS (custom domain first, then *.replit.app; never the private *.replit.dev). */
function bkReplitDomain() {
  if (!process.env.REPLIT_DEPLOYMENT) return '';
  const list = String(process.env.REPLIT_DOMAINS || '').split(',').map((d) => normalizeHost(d)).filter(Boolean);
  return list.find((d) => !d.endsWith('.replit.app') && !d.endsWith('.replit.dev')) || list.find((d) => d.endsWith('.replit.app')) || '';
}
/** Platform default hostnames: a relay / custom domain the visitor used beats these. */
function bkIsPlatformHost(h) { return /(^|\.)(up\.railway\.app|replit\.app|replit\.dev)$/.test(String(h || '')); }
/** Normalize "https://Name.example.com:443/path" -> "name.example.com" (IPv6 literals kept). */
function normalizeHost(v) {
  let h = String(v || '').trim();
  if (!h) return '';
  h = h.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('/')[0].split('?')[0].split('#')[0];
  if (h.startsWith('[')) return h.slice(0, h.indexOf(']') + 1);
  if ((h.match(/:/g) || []).length === 1) h = h.split(':')[0];
  return h.toLowerCase();
}
function isIpLiteral(h) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':') || h.startsWith('[');
}
// BK_PROTOCOLS_APPLIED: every path / gRPC service routed on the single public port
const BK_P = '/@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--';
const BK_PATHS = {
  vlessWs: BK_P + 'ws',
  vmessWs: BK_P + 'vmess',
  trojanWs: BK_P + 'trojan',
  vlessHu: BK_P + 'httpupgrade',
  vmessHu: BK_P + 'vmess-hu',
  trojanHu: BK_P + 'trojan-hu',
  xhttp: BK_P + 'xhttp',
  ssWs: BK_P + 'ss',
  grpcService: BK_P.slice(1) + 'grpc'
};
const BK_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Short, non-secret form of a credential for logs. */
function bkMask(v) { v = String(v || ''); return v ? v.slice(0, 4) + '…' + '(' + v.length + ' chars)' : '(empty)'; }
/** Shadowsocks 2022 methods need a base64 key of an exact length. */
function bkSs2022KeyLen(method) { return /^2022-blake3-aes-128-gcm$/i.test(method) ? 16 : (/^2022-blake3-/i.test(method) ? 32 : 0); }

/**
 * Default configuration template for Blue Knight Gate
 */
const DEFAULT_CONFIG = {
  brand: 'Blue Knight Net',
  product: 'Blue Knight Gate',
  tagline: 'One port. Many paths. Blue Knight Net.',
  sponsorUrl: 'https://t.me/whitedns',
  sponsorName: 'WhiteDNS',
  publicPort: parseInt(process.env.PORT || process.env.SERVER_PORT || '8080', 10) || 8080,
  panelPath: 'knight',
  dataDirHint: '/data',
  uuid: '',
  domain: '',
  forceHost: '',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.SUB_BASE_URL || '',
  subBase: process.env.SUB_BASE || '',
  forceHttps: process.env.FORCE_HTTPS === 'true' || false,
  allowLocalHostLinks: false,
  nodePrefix: '',
  sniHy2: 'www.google.com',
  massProxyUrl: 'https://www.gstatic.com',
  enable: {
    hysteria2: false,
    vlessWs: true,
    vlessWsTls: true,
    vlessHttpUpgrade: true,
    vmessHttpUpgrade: true,
    trojanHttpUpgrade: true,
    vlessXhttp: false,
    vlessGrpc: true,
    vlessGrpcTls: true,
    trojanWs: true,
    trojanWsTls: true,
    ssWs: false,
    trojanGrpcTls: true,
    vmessWsTls: true,
    vmessWs: true,
    reality: true,
    shadowTlsVless: false,
    shadowsocks: true,
    wireguard: true,
    tuic: false,
    socks: false,
    httpProxy: false,
    argo: false
  },
  argo: {
    domain: '',
    auth: '',
    localPort: 8001
  },
  reality: {
    target: 'www.microsoft.com',
    targetPort: 443,
    shortId: ''
  },
  shadowTls: {
    sni: 'www.microsoft.com',
    password: ''
  },
  shadowsocks: {
    method: 'aes-256-gcm',
    password: ''
  },
  wireguard: {
    port: 51820,
    serverIp: '10.66.66.1/24',
    clientIp: '10.66.66.2/32',
    mtu: 1420
  },
  tuic: {
    port: 8443,
    congestionController: 'bbr'
  },
  socks: {
    user: '',
    pass: ''
  },
  httpProxy: {
    user: '',
    pass: ''
  },
  singBoxVersion: '1.11.15',
  xrayVersion: '',
  panelToken: '',
  cpuLimitPercent: null,
  quietConsoleAfterMs: 180000,
  channelUrl: 'https://t.me/BlueKnight_Net'
};

/**
 * Determine suitable writable data directory for Railway (volume) or local
 */
function resolveDataDir(hint = '/data') { // BK_ZEROCONF_APPLIED
  const tryDir = (dir) => {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      const probe = path.join(dir, '.bk-write-test');
      fs.writeFileSync(probe, 'ok'); fs.unlinkSync(probe);
      return true;
    } catch { return false; }
  };
  const candidates = [
    [process.env.BK_DATA_DIR || process.env.FILE_PATH, 'BK_DATA_DIR'],
    [process.env.RAILWAY_VOLUME_MOUNT_PATH, 'Railway volume (RAILWAY_VOLUME_MOUNT_PATH)'],
    [hint, 'default ' + hint],
    [path.join(process.cwd(), 'bk-data'), './bk-data fallback'],
    [path.join(__dirname, 'bk-data'), 'app-dir bk-data fallback'],
    [path.join(os.tmpdir(), 'bk-data'), 'temp-dir fallback']
  ];
  for (const [dir, source] of candidates) {
    if (dir && tryDir(dir)) { resolveDataDir.info = { dir, source }; return dir; }
  }
  const dir = path.join(os.tmpdir(), 'bk-data');
  resolveDataDir.info = { dir, source: 'temp-dir fallback (not writable?)' };
  return dir;
}

/**
 * Merge user runtime config with environment variables and defaults
 */
function buildConfig(userOverrides = {}) {
  const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  // Merge direct overrides
  if (userOverrides && typeof userOverrides === 'object') {
    for (const [key, val] of Object.entries(userOverrides)) {
      if (val !== undefined && val !== null) {
        if (typeof val === 'object' && !Array.isArray(val) && cfg[key] && typeof cfg[key] === 'object') {
          cfg[key] = { ...cfg[key], ...val };
        } else {
          cfg[key] = val;
        }
      }
    }
  }

  // Environment variables overrides
  const env = process.env;
  const parseBool = (v, defaultVal) => (v !== undefined ? v === '1' || v === 'true' : defaultVal);

  if (env.PORT || env.SERVER_PORT || env.SB_PORT) {
    const parsedPort = parseInt(env.PORT || env.SERVER_PORT || env.SB_PORT, 10);
    if (!isNaN(parsedPort) && parsedPort > 0) {
      cfg.publicPort = parsedPort;
    }
  }
  if (env.UUID || env.SB_UUID) cfg.uuid = env.UUID || env.SB_UUID;
  if (env.DOMAIN || env.SB_DOMAIN) cfg.domain = env.DOMAIN || env.SB_DOMAIN;
  if (env.FORCE_HOST || env.CFIP) cfg.forceHost = env.FORCE_HOST || env.CFIP;
  if (env.ALLOW_LOCALHOST_LINKS !== undefined) cfg.allowLocalHostLinks = parseBool(env.ALLOW_LOCALHOST_LINKS, false);
  if (env.PANEL_PATH || env.SUB_PATH) cfg.panelPath = (env.PANEL_PATH || env.SUB_PATH).replace(/^\//, '');
  if (env.NODE_PREFIX) cfg.nodePrefix = env.NODE_PREFIX;
  if (env.PANEL_TOKEN) cfg.panelToken = env.PANEL_TOKEN;
  if (env.SNI_HY2 || env.SB_SNI) cfg.sniHy2 = env.SNI_HY2 || env.SB_SNI;
  if (env.MASS_PROXY_URL || env.SB_MASS_PROXY) cfg.massProxyUrl = env.MASS_PROXY_URL || env.SB_MASS_PROXY;

  // Protocol enable switches via env
  if (env.ENABLE_HYSTERIA2 !== undefined) cfg.enable.hysteria2 = parseBool(env.ENABLE_HYSTERIA2, cfg.enable.hysteria2);
  if (env.ENABLE_VLESS_WS !== undefined) cfg.enable.vlessWs = parseBool(env.ENABLE_VLESS_WS, cfg.enable.vlessWs);
  if (env.ENABLE_HTTPUPGRADE !== undefined) cfg.enable.vlessHttpUpgrade = parseBool(env.ENABLE_HTTPUPGRADE, cfg.enable.vlessHttpUpgrade);
  if (env.ENABLE_XHTTP !== undefined) cfg.enable.vlessXhttp = parseBool(env.ENABLE_XHTTP, cfg.enable.vlessXhttp);
  else if (bkOnEdgeHost()) cfg.enable.vlessXhttp = true;
  if (env.XRAY_VERSION) cfg.xrayVersion = String(env.XRAY_VERSION).trim().replace(/^v/i, '');
  if (env.ENABLE_REALITY !== undefined) cfg.enable.reality = parseBool(env.ENABLE_REALITY, cfg.enable.reality);
  if (env.ENABLE_VLESS_GRPC !== undefined) cfg.enable.vlessGrpc = parseBool(env.ENABLE_VLESS_GRPC, cfg.enable.vlessGrpc);
  // BK_PROTOCOLS_APPLIED: per-type switches (all share the one public PORT)
  const bkSw = { ENABLE_VLESS_WS_TLS: 'vlessWsTls', ENABLE_VMESS_WS: 'vmessWs', ENABLE_VMESS_WS_TLS: 'vmessWsTls',
    ENABLE_VLESS_GRPC_TLS: 'vlessGrpcTls', ENABLE_TROJAN_GRPC_TLS: 'trojanGrpcTls', ENABLE_TROJAN_WS_TLS: 'trojanWsTls',
    ENABLE_VMESS_HTTPUPGRADE: 'vmessHttpUpgrade', ENABLE_TROJAN_HTTPUPGRADE: 'trojanHttpUpgrade', ENABLE_SS_WS: 'ssWs' };
  for (const [k, f] of Object.entries(bkSw)) if (env[k] !== undefined) cfg.enable[f] = parseBool(env[k], cfg.enable[f]);
  if (env.ENABLE_TROJAN_WS !== undefined || env.ENABLE_TROJAN !== undefined) {
    cfg.enable.trojanWs = parseBool(env.ENABLE_TROJAN_WS !== undefined ? env.ENABLE_TROJAN_WS : env.ENABLE_TROJAN, cfg.enable.trojanWs);
  }
  if (env.ENABLE_SHADOWTLS_VLESS !== undefined) cfg.enable.shadowTlsVless = parseBool(env.ENABLE_SHADOWTLS_VLESS, cfg.enable.shadowTlsVless);
  if (env.ENABLE_SS !== undefined) cfg.enable.shadowsocks = parseBool(env.ENABLE_SS, cfg.enable.shadowsocks);
  if (env.ENABLE_WIREGUARD !== undefined || env.ENABLE_WG !== undefined) {
    cfg.enable.wireguard = parseBool(env.ENABLE_WIREGUARD !== undefined ? env.ENABLE_WIREGUARD : env.ENABLE_WG, cfg.enable.wireguard);
  }
  if (env.ENABLE_TUIC !== undefined) cfg.enable.tuic = parseBool(env.ENABLE_TUIC, cfg.enable.tuic);
  if (env.ENABLE_SOCKS !== undefined) cfg.enable.socks = parseBool(env.ENABLE_SOCKS, cfg.enable.socks);
  if (env.ENABLE_HTTP_PROXY !== undefined) cfg.enable.httpProxy = parseBool(env.ENABLE_HTTP_PROXY, cfg.enable.httpProxy);
  if (env.ENABLE_ARGO !== undefined) cfg.enable.argo = parseBool(env.ENABLE_ARGO, cfg.enable.argo);

  if (env.WG_PORT) cfg.wireguard.port = parseInt(env.WG_PORT, 10);
  if (env.WG_SERVER_IP) cfg.wireguard.serverIp = env.WG_SERVER_IP;
  if (env.WG_CLIENT_IP) cfg.wireguard.clientIp = env.WG_CLIENT_IP;

  if (env.TUIC_PORT) cfg.tuic.port = parseInt(env.TUIC_PORT, 10);
  if (env.TUIC_CC) cfg.tuic.congestionController = env.TUIC_CC;

  if (env.ARGO_DOMAIN) cfg.argo.domain = env.ARGO_DOMAIN;
  if (env.ARGO_AUTH) cfg.argo.auth = env.ARGO_AUTH;
  if (env.ARGO_PORT) cfg.argo.localPort = parseInt(env.ARGO_PORT, 10);

  if (env.REALITY_TARGET) cfg.reality.target = env.REALITY_TARGET;
  if (env.REALITY_TARGET_PORT) cfg.reality.targetPort = parseInt(env.REALITY_TARGET_PORT, 10);
  if (env.REALITY_SHORT_ID) cfg.reality.shortId = env.REALITY_SHORT_ID;

  // BLUE KNIGHT CUSTOM: VLESS only, plain WebSocket + HTTPUpgrade.
  // Environment switches cannot re-enable removed protocols or TLS variants.
  cfg.enable = {
    hysteria2: false, vlessWs: true, vlessWsTls: false, vlessHttpUpgrade: true,
    vmessHttpUpgrade: false, trojanHttpUpgrade: false, vlessGrpc: false, vlessGrpcTls: false,
    trojanWs: false, trojanWsTls: false, trojanGrpcTls: false, vmessWsTls: false, vmessWs: false,
    vlessXhttp: false, ssWs: false, reality: false, shadowTlsVless: false, shadowsocks: false,
    wireguard: false, tuic: false, socks: false, httpProxy: false, argo: false
  };

  if (env.SHADOWTLS_SNI) cfg.shadowTls.sni = env.SHADOWTLS_SNI;
  if (env.SHADOWTLS_PASSWORD) cfg.shadowTls.password = env.SHADOWTLS_PASSWORD;

  if (env.SS_METHOD) cfg.shadowsocks.method = env.SS_METHOD;
  if (env.SS_PASSWORD) cfg.shadowsocks.password = env.SS_PASSWORD;

  if (env.CPU_LIMIT_PERCENT) cfg.cpuLimitPercent = parseInt(env.CPU_LIMIT_PERCENT, 10);

  // Public hostname: DOMAIN / FORCE_HOST win, then Railway's generated domain. Never fall back to an
  // egress IP on Railway (the edge routes by hostname only; an IP link can never connect).
  // Replit: REPLIT_DOMAINS (published app only). Railway: RAILWAY_PUBLIC_DOMAIN.
  cfg.domain = normalizeHost(cfg.domain) || bkReplitDomain() || normalizeHost(env.RAILWAY_PUBLIC_DOMAIN) || normalizeHost(env.RAILWAY_STATIC_URL) || '';
  cfg.forceHost = normalizeHost(cfg.forceHost) || '';

  // Data paths
  const dataDir = resolveDataDir(cfg.dataDirHint);
  const paths = {
    dataDir,
    stateFile: path.join(dataDir, 'state.json'),
    binDir: path.join(dataDir, 'bin'),
    certDir: path.join(dataDir, 'cert'),
    certPath: path.join(dataDir, 'cert', 'cert.pem'),
    keyPath: path.join(dataDir, 'cert', 'key.pem'),
    singboxBin: path.join(dataDir, 'bin', os.platform() === 'win32' ? 'sing-box.exe' : 'sing-box'),
    singboxConfig: path.join(dataDir, 'sing-box.json'),
    singboxLog: path.join(dataDir, 'sing-box.log'),
    xrayBin: path.join(dataDir, 'bin', os.platform() === 'win32' ? 'xray.exe' : 'xray'),
    xrayConfig: path.join(dataDir, 'xray.json'),
    xrayLog: path.join(dataDir, 'xray.log'),
    cloudflaredBin: path.join(dataDir, 'bin', os.platform() === 'win32' ? 'cloudflared.exe' : 'cloudflared'),
    cloudflaredLog: path.join(dataDir, 'cloudflared.log')
  };

  return {
    ...cfg,
    paths
  };
}

// --- Module: lib/ports.js ---
/**
 * Finds an available TCP port on localhost (127.0.0.1)
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      const port = typeof address === 'object' && address ? address.port : null;
      srv.close((err) => {
        if (err) return reject(err);
        if (!port) return reject(new Error('Failed to resolve ephemeral port'));
        resolve(port);
      });
    });
  });
}

/**
 * Allocates multiple distinct free local ports
 */
async function allocatePorts(count = 1) {
  const ports = [];
  for (let i = 0; i < count; i++) {
    // Small delay ensures OS port reclamation doesn't return same port
    const p = await findFreePort();
    ports.push(p);
  }
  return count === 1 ? ports[0] : ports;
}

// --- Module: lib/state.js ---
function deriveX25519PublicKey(privBase64) {
  try {
    if (!privBase64 || typeof privBase64 !== 'string') return null;
    const privBuf = Buffer.from(privBase64.trim(), 'base64');
    if (privBuf.length !== 32) return null;
    const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), privBuf]);
    const keyObj = crypto.createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
    return crypto.createPublicKey(keyObj).export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  } catch {
    return null;
  }
}

class StateManager {
  constructor(paths, initialConfig) {
    this.paths = paths;
    this.config = initialConfig;
    this.state = {
      uuid: '',
      hy2Password: '',
      hy2ObfsPassword: '',
      realityPrivateKey: '',
      realityPublicKey: '',
      realityShortId: '',
      shadowTlsPassword: '',
      shadowsocksPassword: '',
      wireguardPrivateKey: '',
      wireguardPublicKey: '',
      wireguardClientPrivateKey: '',
      wireguardClientPublicKey: '',
      publicIp: '',
      links: [],
      clashYaml: '',
      singboxJson: '',
      xrayJson: '',
      base64Sub: '',
      updatedAt: null
    };
  }

  loadOrCreate() {
    try {
      fs.mkdirSync(this.paths.dataDir, { recursive: true });
      if (fs.existsSync(this.paths.stateFile)) {
        const raw = fs.readFileSync(this.paths.stateFile, 'utf8');
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
      }
    } catch (err) {
      Logger.warn(`Failed to read existing state.json: ${err.message}. Generating fresh state.`);
    }

    // UUID: Config (env UUID) -> Persisted state -> Generate
    if (this.config.uuid) {
      const raw = String(this.config.uuid).trim();
      if (BK_UUID_RE.test(raw)) {
        this.state.uuid = raw.toLowerCase();
      } else {
        // sing-box rejects non-UUID ids (the whole config would fail): derive a stable UUID from the value instead.
        const h = crypto.createHash('sha256').update(raw).digest();
        h[6] = (h[6] & 0x0f) | 0x40; h[8] = (h[8] & 0x3f) | 0x80;
        const x = h.subarray(0, 16).toString('hex');
        this.state.uuid = `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
        Logger.warn('UUID env value is not a valid UUID (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx); using a stable UUID derived from it.');
      }
    } else if (!this.state.uuid || !BK_UUID_RE.test(this.state.uuid)) {
      this.state.uuid = crypto.randomUUID();
    }

    // One-time migration: remove the old eight auto-generated credentials.
    // From now on, VLESS users are created only through the Telegram bot.
    if (!this.state.telegramUsersInitialized) {
      this.state.vlessUuids = [];
      this.state.vlessUserNames = [];
      this.state.telegramUsersInitialized = true;
    }

    // Keep only explicitly created credentials; never pre-create default users.
    const existingIds = Array.isArray(this.state.vlessUuids) ? this.state.vlessUuids : [];
    const uniqueIds = [];
    const usedIds = new Set();
    for (let i = 0; i < Math.min(existingIds.length, 64); i++) {
      const id = String(existingIds[i] || '').toLowerCase();
      if (BK_UUID_RE.test(id) && !usedIds.has(id)) {
        uniqueIds[i] = id;
        usedIds.add(id);
      } else {
        uniqueIds[i] = null;
      }
    }
    while (uniqueIds.length && uniqueIds[uniqueIds.length - 1] === null) uniqueIds.pop();
    this.state.vlessUuids = uniqueIds;
    // Keep an internal UUID for protocols that need a server identity, without
    // exposing or provisioning it as a user configuration.
    this.state.uuid = uniqueIds[0] || this.state.uuid || crypto.randomUUID();

    // Hysteria2 credentials
    this.state.hy2Password = this.state.uuid;
    if (!this.state.hy2ObfsPassword) {
      this.state.hy2ObfsPassword = crypto.randomBytes(8).toString('hex');
    }

    // ShadowTLS credentials
    if (this.config.shadowTls.password) {
      this.state.shadowTlsPassword = this.config.shadowTls.password;
    } else if (!this.state.shadowTlsPassword) {
      this.state.shadowTlsPassword = crypto.randomBytes(12).toString('hex');
    }

    // Shadowsocks credentials
    if (this.config.shadowsocks.password) {
      this.state.shadowsocksPassword = this.config.shadowsocks.password;
    } else if (!this.state.shadowsocksPassword) {
      this.state.shadowsocksPassword = crypto.randomBytes(16).toString('base64url');
    }
    // Shadowsocks 2022 needs a base64 key of exactly 16/32 bytes
    const ssKeyLen = bkSs2022KeyLen(this.config.shadowsocks.method || '');
    if (ssKeyLen) {
      let ok = false;
      try { ok = /^[A-Za-z0-9+/]+={0,2}$/.test(this.state.shadowsocksPassword) && Buffer.from(this.state.shadowsocksPassword, 'base64').length === ssKeyLen; } catch (_) {}
      if (!ok) {
        if (this.config.shadowsocks.password) Logger.warn(`SS_PASSWORD is not a base64 ${ssKeyLen}-byte key (required by ${this.config.shadowsocks.method}); using a generated key.`);
        this.state.ssKey2022 = (this.state.ssKey2022 && Buffer.from(this.state.ssKey2022, 'base64').length === ssKeyLen) ? this.state.ssKey2022 : crypto.randomBytes(ssKeyLen).toString('base64');
        this.state.shadowsocksPassword = this.state.ssKey2022;
      }
    }

    // Reality shortId (only if enabled)
    if (!(this.config.enable && this.config.enable.reality)) {
      this.state.realityShortId = '';
    } else if (this.config.reality.shortId) {
      this.state.realityShortId = this.config.reality.shortId;
    } else if (!this.state.realityShortId) {
      this.state.realityShortId = crypto.randomBytes(4).toString('hex');
    }

    if (this.config.enable && this.config.enable.wireguard) {
    // WireGuard keypairs (Server & Client)
    const isValidKey = (k) => typeof k === 'string' && k.trim().length >= 40;
    let srvPriv = this.state.wireguardPrivateKey;
    let srvPub = this.state.wireguardPublicKey;
    let cliPriv = this.state.wireguardClientPrivateKey;
    let cliPub = this.state.wireguardClientPublicKey;

    if (!isValidKey(srvPriv) || !isValidKey(srvPub)) {
      try {
        const srv = crypto.generateKeyPairSync('x25519');
        srvPriv = srv.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        srvPub = srv.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (err) {
        Logger.warn(`Failed to generate WireGuard server keypair: ${err.message}`);
      }
    } else {
      const derived = deriveX25519PublicKey(srvPriv);
      if (derived) srvPub = derived;
    }

    if (!isValidKey(cliPriv) || !isValidKey(cliPub)) {
      try {
        const cli = crypto.generateKeyPairSync('x25519');
        cliPriv = cli.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        cliPub = cli.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (err) {
        Logger.warn(`Failed to generate WireGuard client keypair: ${err.message}`);
      }
    } else {
      const derived = deriveX25519PublicKey(cliPriv);
      if (derived) cliPub = derived;
    }

    this.state.wireguardPrivateKey = srvPriv;
    this.state.wireguardPublicKey = srvPub;
    this.state.wireguardClientPrivateKey = cliPriv;
    this.state.wireguardClientPublicKey = cliPub;
    } else {
      this.state.wireguardPrivateKey = '';
      this.state.wireguardPublicKey = '';
      this.state.wireguardClientPrivateKey = '';
      this.state.wireguardClientPublicKey = '';
    }

    this.save();
    return this.state;
  }

  setRealityKeys(privateKey, publicKey) {
    this.state.realityPrivateKey = privateKey;
    this.state.realityPublicKey = publicKey;
    this.save();
  }

  setWireGuardKeys(serverPriv, serverPub, clientPriv, clientPub) {
    this.state.wireguardPrivateKey = serverPriv;
    this.state.wireguardPublicKey = serverPub;
    this.state.wireguardClientPrivateKey = clientPriv;
    this.state.wireguardClientPublicKey = clientPub;
    this.save();
  }

  setLinks(links, clashYaml = '', singboxJson = '', xrayJson = '') {
    this.state.links = links;
    this.state.clashYaml = clashYaml;
    this.state.singboxJson = singboxJson;
    this.state.xrayJson = xrayJson;
    this.state.base64Sub = Buffer.from(links.join('\n')).toString('base64');
    this.save();
  }

  setPublicIp(ip) {
    this.state.publicIp = ip;
    this.save();
  }

  save() {
    try {
      this.state.updatedAt = new Date().toISOString();
      fs.mkdirSync(this.paths.dataDir, { recursive: true });
      fs.writeFileSync(this.paths.stateFile, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      Logger.warn(`Could not save state.json: ${err.message}`);
    }
  }
}

StateManager.deriveX25519PublicKey = deriveX25519PublicKey;

// --- Module: lib/binaries.js ---
/**
 * Normalizes system architecture to sing-box and xray standard
 */
function getNormalizedArch() {
  const arch = os.arch();
  if (arch === 'arm64' || arch === 'aarch64') {
    return { sb: 'arm64', xray: 'arm64-v8a', cf: 'arm64' };
  }
  return { sb: 'amd64', xray: '64', cf: 'amd64' };
}

/**
 * Checks free disk space in megabytes using df -m if on Linux
 */
function checkDiskSpaceMb(dir) {
  if (os.platform() !== 'linux') return 1024; // assume OK on dev machines
  try {
    const res = spawnSync('df', ['-m', dir], { encoding: 'utf8', timeout: 3000 });
    if (res.status === 0 && res.stdout) {
      const lines = res.stdout.trim().split('\n');
      if (lines.length >= 2) {
        const parts = lines[1].trim().split(/\s+/);
        const avail = parseInt(parts[3], 10);
        if (!isNaN(avail)) return avail;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Download a file with timeout and streaming
 */
async function downloadToFile(url, destPath) {
  const tempPath = `${destPath}.tmp_${Date.now()}`;
  const writer = fs.createWriteStream(tempPath);

  try {
    const resp = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'BlueKnightGate/1.0'
      }
    });

    await new Promise((resolve, reject) => {
      resp.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    fs.renameSync(tempPath, destPath);
    if (os.platform() !== 'win32') {
      fs.chmodSync(destPath, 0o755);
    }
    return true;
  } catch (err) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
    throw err;
  }
}

/** Extract a single file (by base name) from a .zip without external tools (Railway images may lack unzip). */
function extractFromZip(zipPath, wantNames) {
  const buf = fs.readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('zip: end of central directory not found');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('zip: bad central directory');
    const method = buf.readUInt16LE(off + 10);
    const crc = buf.readUInt32LE(off + 16) >>> 0;
    const csize = buf.readUInt32LE(off + 20);
    const usize = buf.readUInt32LE(off + 24);
    const nlen = buf.readUInt16LE(off + 28), elen = buf.readUInt16LE(off + 30), clen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nlen);
    off += 46 + nlen + elen + clen;
    const base = name.split('/').pop();
    if (!wantNames.includes(base)) continue;
    if (buf.readUInt32LE(lho) !== 0x04034b50) throw new Error('zip: bad local header');
    const start = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.subarray(start, start + csize);
    let data;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) data = zlib.inflateRawSync(raw);
    else throw new Error('zip: unsupported compression method ' + method);
    if (data.length !== usize) throw new Error('zip: size mismatch for ' + base);
    if (typeof zlib.crc32 === 'function' && (zlib.crc32(data) >>> 0) !== crc) throw new Error('zip: CRC mismatch for ' + base);
    return { name: base, data };
  }
  return null;
}

/** Fetch "<url>.dgst" (Xray release format) and return the SHA-256 hex, or null if unavailable. */
async function fetchSha256Digest(url) {
  try {
    const r = await axios.get(url + '.dgst', { timeout: 20000, responseType: 'text', headers: { 'User-Agent': 'BlueKnightGate/1.0' } });
    const m = /SHA2?-?256[^=]*=\s*([0-9a-f]{64})/i.exec(String(r.data || ''));
    return m ? m[1].toLowerCase() : null;
  } catch (_) {
    return null;
  }
}

class BinaryManager {
  constructor(config) {
    this.config = config;
    this.paths = config.paths;
    this.arch = getNormalizedArch();
  }

  ensureDirectories() {
    fs.mkdirSync(this.paths.dataDir, { recursive: true });
    fs.mkdirSync(this.paths.binDir, { recursive: true });
    fs.mkdirSync(this.paths.certDir, { recursive: true });
  }

  async ensureSingBox() {
    this.ensureDirectories();
    const bin = this.paths.singboxBin;

    // Check if valid executable already exists
    if (fs.existsSync(bin)) {
      try {
        const stat = fs.statSync(bin);
        if (stat.size > 1024 * 1024) {
          if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
          return true;
        }
      } catch {}
    }

    const freeMb = checkDiskSpaceMb(this.paths.binDir);
    if (freeMb !== null && freeMb < 40) {
      Logger.warn(`Low disk space (~${freeMb}MB free). sing-box download might fail with ENOSPC.`);
    }

    const ver = this.config.singBoxVersion || '1.11.15';
    const osType = os.platform() === 'win32' ? 'windows' : 'linux';
    const ext = osType === 'windows' ? 'zip' : 'tar.gz';
    const tarName = `sing-box-${ver}-${osType}-${this.arch.sb}.${ext}`;
    const url = process.env.SB_URL || `https://github.com/SagerNet/sing-box/releases/download/v${ver}/${tarName}`;
    const archivePath = path.join(this.paths.binDir, tarName);

    Logger.step(`Downloading sing-box v${ver} (${osType}-${this.arch.sb})...`);

    try {
      await downloadToFile(url, archivePath);

      if (osType === 'linux') {
        const extDir = path.join(this.paths.binDir, `sb_extract_${Date.now()}`);
        fs.mkdirSync(extDir, { recursive: true });
        const tarRes = spawnSync('tar', ['-xzf', archivePath, '-C', extDir]);
        if (tarRes.status !== 0) throw new Error(`tar extraction failed: ${tarRes.stderr}`);

        // Locate sing-box inside extracted directory
        const files = fs.readdirSync(extDir);
        let foundBin = null;
        for (const f of files) {
          const sub = path.join(extDir, f);
          if (fs.statSync(sub).isDirectory()) {
            const candidate = path.join(sub, 'sing-box');
            if (fs.existsSync(candidate)) {
              foundBin = candidate;
              break;
            }
          }
        }

        if (!foundBin && fs.existsSync(path.join(extDir, 'sing-box'))) {
          foundBin = path.join(extDir, 'sing-box');
        }

        if (!foundBin) throw new Error('sing-box binary not found in archive');

        fs.copyFileSync(foundBin, bin);
        fs.chmodSync(bin, 0o755);

        // Cleanup
        try {
          fs.unlinkSync(archivePath);
          fs.rmSync(extDir, { recursive: true, force: true });
        } catch {}
      }

      Logger.success('sing-box engine installed successfully.');
      return true;
    } catch (err) {
      Logger.error(`sing-box installation error: ${err.message}`);
      return false;
    }
  }

  async ensureXray() {
    this.ensureDirectories();
    const bin = this.paths.xrayBin;
    const want = String(process.env.XRAY_VERSION || this.config.xrayVersion || '').trim().replace(/^v/i, '');
    const probe = () => {
      try {
        const r = spawnSync(bin, ['version'], { encoding: 'utf8', timeout: 15000 });
        const m = /Xray\s+v?(\d+\.\d+\.\d+)/.exec(r.stdout || '');
        return r.status === 0 && m ? m[1] : null;
      } catch (_) { return null; }
    };

    if (fs.existsSync(bin)) {
      if (os.platform() !== 'win32') { try { fs.chmodSync(bin, 0o755); } catch (_) {} }
      const have = probe();
      if (have && (!want || want === have)) {
        Logger.success(`Xray-core ${have} ready (cached in ${this.paths.binDir}).`);
        return true;
      }
      if (have) Logger.info(`Xray-core ${have} cached but XRAY_VERSION=${want} requested - downloading.`);
      else Logger.warn('Cached Xray-core binary is not runnable - re-downloading.');
    }

    const freeMb = checkDiskSpaceMb(this.paths.binDir);
    if (freeMb !== null && freeMb < 60) {
      Logger.warn(`Low disk space (~${freeMb}MB free). Xray-core download might fail.`);
    }

    const osType = os.platform() === 'win32' ? 'windows' : 'linux';
    const zipName = `Xray-${osType}-${this.arch.xray}.zip`;
    const url = process.env.XRAY_URL || (want
      ? `https://github.com/XTLS/Xray-core/releases/download/v${want}/${zipName}`
      : `https://github.com/XTLS/Xray-core/releases/latest/download/${zipName}`);
    const exeName = osType === 'windows' ? 'xray.exe' : 'xray';
    Logger.step(`Downloading Xray-core ${want ? 'v' + want : '(latest stable)'} (${osType}-${this.arch.xray})...`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const archivePath = path.join(this.paths.binDir, `${zipName}.${Date.now()}`);
      const tmpBin = bin + '.new';
      try {
        await downloadToFile(url, archivePath);
        if (!process.env.XRAY_URL) {
          const expected = await fetchSha256Digest(url);
          const actual = crypto.createHash('sha256').update(fs.readFileSync(archivePath)).digest('hex');
          if (expected && expected !== actual) throw new Error('SHA-256 mismatch (download corrupted)');
          if (expected) Logger.info('Xray-core archive SHA-256 verified.');
          else Logger.warn('Xray-core .dgst not available; skipped SHA-256 check.');
        }
        const entry = extractFromZip(archivePath, [exeName]);
        if (!entry) throw new Error(exeName + ' not found in archive');
        fs.writeFileSync(tmpBin, entry.data);
        if (os.platform() !== 'win32') fs.chmodSync(tmpBin, 0o755);
        fs.renameSync(tmpBin, bin);
        const ver = probe();
        if (!ver) throw new Error('downloaded binary does not run');
        Logger.success(`Xray-core ${ver} installed (${osType}-${this.arch.xray}).`);
        return true;
      } catch (err) {
        Logger.warn(`Xray-core download attempt ${attempt}/3 failed: ${err.message}`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } finally {
        try { fs.unlinkSync(archivePath); } catch (_) {}
        try { if (fs.existsSync(tmpBin)) fs.unlinkSync(tmpBin); } catch (_) {}
      }
    }
    Logger.error('Xray-core unavailable - VLESS-XHTTP disabled for this run.');
    return false;
  }

  async ensureCloudflared() {
    this.ensureDirectories();
    const bin = this.paths.cloudflaredBin;

    if (fs.existsSync(bin)) {
      try {
        if (fs.statSync(bin).size > 1024 * 1024) {
          if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
          return true;
        }
      } catch {}
    }

    const url = os.platform() === 'win32'
      ? `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-${this.arch.cf === 'arm64' ? 'arm64' : 'amd64'}.exe`
      : `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${this.arch.cf}`;

    Logger.step('Downloading optional Cloudflare Argo tunnel agent (cloudflared)...');

    try {
      await downloadToFile(url, bin);
      if (os.platform() !== 'win32') fs.chmodSync(bin, 0o755);
      Logger.success('cloudflared installed successfully.');
      return true;
    } catch (err) {
      Logger.warn(`Optional cloudflared download skipped: ${err.message}. Argo tunnel will be inactive.`);
      return false;
    }
  }
}

// --- Module: lib/cert.js ---
function asn1(tag, ...children) {
  const content = Buffer.concat(children);
  let len;
  if (content.length < 128) {
    len = Buffer.from([content.length]);
  } else if (content.length < 256) {
    len = Buffer.from([0x81, content.length]);
  } else if (content.length < 65536) {
    len = Buffer.from([0x82, (content.length >> 8) & 0xff, content.length & 0xff]);
  } else {
    len = Buffer.from([0x83, (content.length >> 16) & 0xff, (content.length >> 8) & 0xff, content.length & 0xff]);
  }
  return Buffer.concat([Buffer.from([tag]), len, content]);
}

function seq(...ch) { return asn1(0x30, ...ch); }
function int(val) { return asn1(0x02, Buffer.isBuffer(val) ? val : Buffer.from([val])); }
function oid(bytes) { return asn1(0x06, Buffer.from(bytes)); }
function utf8(str) { return asn1(0x0c, Buffer.from(str, 'utf8')); }
function utcTime(d) {
  const pad = n => String(n).padStart(2, '0');
  const s = String(d.getUTCFullYear()).slice(2) + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  return asn1(0x17, Buffer.from(s, 'ascii'));
}

function generateSelfSignedCert(commonName = 'localhost') {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const spkiDer = publicKey.export({ type: 'spki', format: 'der' });

  // sha256WithRSAEncryption: 1.2.840.113549.1.1.11
  const sigAlg = seq(oid([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]), Buffer.from([0x05, 0x00]));
  const name = seq(asn1(0x31, seq(oid([0x55, 0x04, 0x03]), utf8(commonName))));
  const now = new Date();
  const notAfter = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
  const validity = seq(utcTime(now), utcTime(notAfter));
  const serial = crypto.randomBytes(8);
  serial[0] &= 0x7f; // Ensure positive integer

  const tbs = seq(
    asn1(0xa0, int(2)), // v3
    int(serial),
    sigAlg,
    name,
    validity,
    name,
    spkiDer
  );

  const sig = crypto.sign('sha256', tbs, privateKey);
  const bitSig = Buffer.concat([Buffer.from([0x00]), sig]);
  const certDer = seq(tbs, sigAlg, asn1(0x03, bitSig));
  const certPem = '-----BEGIN CERTIFICATE-----\n' + certDer.toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END CERTIFICATE-----\n';
  const keyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  return { certPem, keyPem };
}

function ensureTlsCertificates(certPath, keyPath, sni = 'localhost') {
  try {
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const c = fs.readFileSync(certPath, 'utf8');
      const k = fs.readFileSync(keyPath, 'utf8');
      if (c.includes('BEGIN CERTIFICATE') && k.includes('PRIVATE KEY')) {
        // BK_PROTOCOLS_APPLIED: renew the self-signed cert shortly before it expires (it is valid for 365 days)
        let expiring = false;
        try { expiring = new Date(new crypto.X509Certificate(c).validTo).getTime() - Date.now() < 3 * 86400000; } catch (_) {}
        if (!expiring) return { cert: c, key: k };
        Logger.warn('Self-signed TLS certificate expired / expiring: generating a new one (TLS links get a new pcs fingerprint).');
      }
    }
  } catch (_) {}

  const certDir = path.dirname(certPath);
  try {
    fs.mkdirSync(certDir, { recursive: true });
  } catch (_) {}

  // 1. Try openssl if available
  try {
    const res = spawnSync('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
      '-subj', `/CN=${sni}`,
      '-keyout', keyPath,
      '-out', certPath,
      '-days', '365'
    ], { timeout: 15000 });
    if (res.status === 0 && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8')
      };
    }
  } catch (_) {}

  // 2. Pure JS fallback
  try {
    const { certPem, keyPem } = generateSelfSignedCert(sni);
    fs.writeFileSync(keyPath, keyPem, 'utf8');
    fs.writeFileSync(certPath, certPem, 'utf8');
    return { cert: certPem, key: keyPem };
  } catch (err) {
    Logger.error(`Failed to generate TLS cert: ${err.message}`);
    return null;
  }
}

/** SHA-256 of the served certificate (DER, hex) for Xray's pinnedPeerCertSha256 / share-link "pcs" and Clash "fingerprint". */
function bkCertSha256(certPath) {
  try {
    const st = fs.statSync(certPath);
    if (bkCertSha256._c && bkCertSha256._c.m === st.mtimeMs && bkCertSha256._c.p === certPath) return bkCertSha256._c.v;
    const v = new crypto.X509Certificate(fs.readFileSync(certPath)).fingerprint256.replace(/:/g, '').toLowerCase();
    bkCertSha256._c = { p: certPath, m: st.mtimeMs, v };
    return v;
  } catch (_) { return ''; }
}

// --- Module: lib/engines/singbox.js ---
class SingBoxEngine {
  constructor(config, stateManager, allocatedPorts) {
    this.config = config;
    this.paths = config.paths;
    this.stateManager = stateManager;
    this.ports = allocatedPorts;
    this.process = null;
  }

  generateRealityKeys() {
    if (!(this.config.enable && this.config.enable.reality)) return;
    const state = this.stateManager.state;
    if (state.realityPrivateKey && state.realityPublicKey) {
      return;
    }

    if (fs.existsSync(this.paths.singboxBin)) {
      try {
        const res = spawnSync(this.paths.singboxBin, ['generate', 'reality-keypair'], {
          encoding: 'utf8',
          timeout: 10000
        });
        const privMatch = /PrivateKey:\s*(\S+)/i.exec(res.stdout || '');
        const pubMatch = /PublicKey:\s*(\S+)/i.exec(res.stdout || '');

        if (privMatch && pubMatch) {
          this.stateManager.setRealityKeys(privMatch[1], pubMatch[1]);
          Logger.success('Generated fresh REALITY keypair.');
          return;
        }
      } catch (_) {}
    }

    // Fallback: Node crypto x25519 keypair
    try {
      const kp = crypto.generateKeyPairSync('x25519');
      const priv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64url');
      const pub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64url');
      this.stateManager.setRealityKeys(priv, pub);
      Logger.success('Generated fresh REALITY keypair via crypto.');
    } catch (err) {
      Logger.warn(`Reality keygen error: ${err.message}.`);
    }
  }

  buildJsonConfig() {
    const state = this.stateManager.state;
    const enable = this.config.enable;
    const wsPath = '/@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--ws';
    const vmessPath = '/@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--vmess';
    const huPath = '/@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--httpupgrade';

    const inbounds = [];

    // 1. VMess + WebSocket (TCP) local inbound
    if ((enable.vmessWs || enable.vmessWsTls) && this.ports.vmessWs) {
      inbounds.push({
        type: 'vmess',
        tag: 'vmess-ws-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vmessWs,
        users: [
          { uuid: state.uuid, alterId: 0 }
        ],
        transport: {
          type: 'ws',
          path: vmessPath,
          max_early_data: 2560,
          early_data_header_name: 'Sec-WebSocket-Protocol'
        }
      });
    }

    // 2. VLESS + WebSocket: only explicitly created Telegram users.
    if (enable.vlessWs) {
      const ids = Array.isArray(state.vlessUuids) ? state.vlessUuids : [state.uuid];
      ids.forEach((uuid, index) => {
        if (!uuid) return;
        const userNo = index + 1;
        const portIndex = index;
        const port = this.ports.vlessWsUsers && this.ports.vlessWsUsers[portIndex];
        if (!port) return;
        inbounds.push({
          type: 'vless', tag: `vless-ws-user-${userNo}-in`, listen: '127.0.0.1', listen_port: port,
          users: [{ uuid, flow: '' }], tls: { enabled: false },
          transport: { type: 'ws', path: `${wsPath}-u${userNo}`, max_early_data: 2560, early_data_header_name: 'Sec-WebSocket-Protocol' }
        });
      });
    }

    // 2b. VLESS + WebSocket + TLS local inbound
    if (enable.vlessWsTls && this.ports.vlessWsTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'vless',
        tag: 'vless-ws-tls-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessWsTls,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['http/1.1'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: {
          type: 'ws',
          path: wsPath,
          max_early_data: 2560,
          early_data_header_name: 'Sec-WebSocket-Protocol'
        }
      });
    }

    // 3. VLESS + HTTPUpgrade: users 5..8 retain their original dedicated inbounds.
    if (enable.vlessHttpUpgrade) {
      const ids = Array.isArray(state.vlessUuids) ? state.vlessUuids : [state.uuid];
      ids.slice(4, 8).forEach((uuid, index) => {
        const userNo = index + 5;
        const port = this.ports.vlessHuUsers && this.ports.vlessHuUsers[index];
        if (!port) return;
        inbounds.push({
          type: 'vless', tag: `vless-httpupgrade-user-${userNo}-in`, listen: '127.0.0.1', listen_port: port,
          users: [{ uuid, flow: '' }], tls: { enabled: false },
          transport: { type: 'httpupgrade', path: `${huPath}-u${userNo}` }
        });
      });
    }

    // 3b. VMess + HTTPUpgrade local inbound (BK_PROTOCOLS_APPLIED)
    if (enable.vmessHttpUpgrade && this.ports.vmessHu) {
      inbounds.push({
        type: 'vmess', tag: 'vmess-hu-in', listen: '127.0.0.1', listen_port: this.ports.vmessHu,
        users: [{ uuid: state.uuid, alterId: 0 }],
        transport: { type: 'httpupgrade', path: BK_PATHS.vmessHu }
      });
    }

    // 3c. Trojan + HTTPUpgrade local inbound
    if (enable.trojanHttpUpgrade && this.ports.trojanHu) {
      inbounds.push({
        type: 'trojan', tag: 'trojan-hu-in', listen: '127.0.0.1', listen_port: this.ports.trojanHu,
        users: [{ password: state.uuid }],
        transport: { type: 'httpupgrade', path: BK_PATHS.trojanHu }
      });
    }

    // 4. VLESS + REALITY (TCP) local inbound
    if (enable.reality && this.ports.reality && state.realityPrivateKey) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-reality-in',
        listen: '127.0.0.1',
        listen_port: this.ports.reality,
        users: [
          { uuid: state.uuid, flow: 'xtls-rprx-vision' }
        ],
        tls: {
          enabled: true,
          server_name: this.config.reality.target || 'www.microsoft.com',
          alpn: ['http/1.1'],
          reality: {
            enabled: true,
            handshake: {
              server: this.config.reality.target || 'www.microsoft.com',
              server_port: this.config.reality.targetPort || 443
            },
            private_key: state.realityPrivateKey,
            short_id: [state.realityShortId]
          }
        }
      });
    }

    // 5. ShadowTLS v3 + VLESS detour
    if (enable.shadowTlsVless && this.ports.shadowTls) {
      inbounds.push(
        {
          type: 'shadowtls',
          tag: 'shadowtls-in',
          listen: '127.0.0.1',
          listen_port: this.ports.shadowTls,
          version: 3,
          users: [
            { name: 'bk-user', password: state.shadowTlsPassword }
          ],
          handshake: {
            server: this.config.shadowTls.sni || 'www.microsoft.com',
            server_port: 443
          },
          strict_mode: true,
          detour: 'vless-shadowtls-detour'
        },
        {
          type: 'vless',
          tag: 'vless-shadowtls-detour',
          listen: '127.0.0.1',
          listen_port: 0,
          users: [
            { uuid: state.uuid, flow: '' }
          ]
        }
      );
    }

    // 6. Shadowsocks (TCP) local inbound
    if (enable.shadowsocks && this.ports.shadowsocks) {
      inbounds.push({
        type: 'shadowsocks',
        tag: 'ss-in',
        listen: '127.0.0.1',
        listen_port: this.ports.shadowsocks,
        method: this.config.shadowsocks.method || 'aes-256-gcm',
        password: state.shadowsocksPassword
      });
    }

    // 7. SOCKS5 (TCP) local inbound
    if (enable.socks && this.ports.socks) {
      inbounds.push({
        type: 'socks',
        tag: 'socks-in',
        listen: '127.0.0.1',
        listen_port: this.ports.socks,
        users: this.config.socks.user
          ? [{ username: this.config.socks.user, password: this.config.socks.pass }]
          : []
      });
    }

    // 8. Plain HTTP Proxy local inbound
    if (enable.httpProxy && this.ports.httpProxy) {
      inbounds.push({
        type: 'http',
        tag: 'http-in',
        listen: '127.0.0.1',
        listen_port: this.ports.httpProxy,
        users: this.config.httpProxy.user
          ? [{ username: this.config.httpProxy.user, password: this.config.httpProxy.pass }]
          : []
      });
    }

    // 9. Trojan + WebSocket (TCP) local inbound
    if (enable.trojanWs && this.ports.trojanWs) {
      inbounds.push({
        type: 'trojan',
        tag: 'trojan-ws-in',
        listen: '127.0.0.1',
        listen_port: this.ports.trojanWs,
        users: [
          { password: state.uuid }
        ],
        transport: {
          type: 'ws',
          path: '/@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--trojan'
        }
      });
    }

    // 9b. Trojan + gRPC + TLS local inbound
    if (enable.trojanGrpcTls && this.ports.trojanGrpcTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'trojan',
        tag: 'trojan-grpc-tls-in',
        listen: '127.0.0.1',
        listen_port: this.ports.trojanGrpcTls,
        users: [
          { password: state.uuid }
        ],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['h2'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: {
          type: 'grpc',
          service_name: '@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--grpc'
        }
      });
    }

    // 10. VLESS + gRPC (TCP) local inbound (also the backend for gRPC-TLS decrypted by the gate's h2 router)
    if ((enable.vlessGrpc || enable.vlessGrpcTls) && this.ports.vlessGrpc) {
      inbounds.push({
        type: 'vless',
        tag: 'vless-grpc-in',
        listen: '127.0.0.1',
        listen_port: this.ports.vlessGrpc,
        users: [
          { uuid: state.uuid, flow: '' }
        ],
        tls: { enabled: false },
        transport: {
          type: 'grpc',
          service_name: '@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--@BlueKnight_Net--grpc'
        }
      });
    }

    // 10b. VLESS + gRPC + TLS local inbound (the mux sends TLS ClientHellos offering only ALPN h2 here)
    if (enable.vlessGrpcTls && this.ports.vlessGrpcTls) {
      ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.domain || 'www.google.com');
      inbounds.push({
        type: 'vless', tag: 'vless-grpc-tls-in', listen: '127.0.0.1', listen_port: this.ports.vlessGrpcTls,
        users: [{ uuid: state.uuid, flow: '' }],
        tls: {
          enabled: true,
          server_name: this.config.domain || 'www.google.com',
          alpn: ['h2'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        },
        transport: { type: 'grpc', service_name: BK_PATHS.grpcService }
      });
    }

    // 11. TUIC v5 inbound (UDP)
    if (enable.tuic && this.config.tuic) {
      inbounds.push({
        type: 'tuic',
        tag: 'tuic-in',
        listen: '::',
        listen_port: this.config.tuic.port || 8443,
        users: [
          { uuid: state.uuid, password: state.uuid }
        ],
        congestion_controller: this.config.tuic.congestionController || 'bbr',
        tls: {
          enabled: true,
          server_name: this.config.sniHy2 || 'www.google.com',
          alpn: ['h3'],
          certificate_path: this.paths.certPath,
          key_path: this.paths.keyPath
        }
      });
    }

    const cfg = {
      log: {
        level: 'info',
        timestamp: true
      },
      inbounds,
      outbounds: [
        { type: 'direct', tag: 'direct' },
        { type: 'block', tag: 'block' }
      ],
      route: {
        final: 'direct'
      }
    };

    // WireGuard under endpoints (NOT inbounds)
    if (enable.wireguard && this.config.wireguard && state.wireguardPrivateKey && state.wireguardClientPublicKey) {
      const wgPort = (this.config.wireguard && this.config.wireguard.port) || 51820;
      cfg.endpoints = [
        {
          type: 'wireguard',
          tag: 'wg-in',
          system: false,
          name: 'bk-wg0',
          mtu: this.config.wireguard.mtu || 1420,
          address: [this.config.wireguard.serverIp || '10.66.66.1/24'],
          private_key: state.wireguardPrivateKey,
          listen_port: wgPort,
          peers: [
            {
              public_key: state.wireguardClientPublicKey,
              allowed_ips: [this.config.wireguard.clientIp || '10.66.66.2/32']
            }
          ]
        }
      ];
    }

    return cfg;
  }

  testConfigSync(cfgObj) {
    const tmpFile = path.join(this.paths.dataDir, `test-check-${Date.now()}.json`);
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(cfgObj, null, 2), 'utf8');
      const res = spawnSync(this.paths.singboxBin, ['check', '-c', tmpFile], {
        encoding: 'utf8',
        timeout: 8000
      });
      try { fs.unlinkSync(tmpFile); } catch {}
      return {
        ok: res.status === 0,
        error: (res.stderr || res.stdout || '').trim()
      };
    } catch (err) {
      try { fs.unlinkSync(tmpFile); } catch {}
      return { ok: false, error: err.message };
    }
  }

  validateAndSanitize(configData) {
    // 1. Initial test
    let check = this.testConfigSync(configData);
    if (check.ok) return configData;

    Logger.warn(`sing-box initial check reported: ${check.error}. Running resilience auto-fix...`);

    // 2. Remove endpoints if failing
    if (configData.endpoints && configData.endpoints.length > 0) {
      delete configData.endpoints;
      check = this.testConfigSync(configData);
      if (check.ok) {
        Logger.warn('sing-box validated after omitting endpoints. Core engines running.');
        return configData;
      }
    }

    // 3. Try removing optional inbounds sequentially
    const optionalTags = ['tuic-in', 'vless-grpc-tls-in', 'trojan-grpc-tls-in', 'vless-grpc-in', 'trojan-hu-in', 'vmess-hu-in', 'trojan-ws-in', 'socks-in', 'http-in', 'shadowtls-in', 'vless-shadowtls-detour'];
    for (const tag of optionalTags) {
      const idx = configData.inbounds.findIndex(ib => ib.tag === tag);
      if (idx !== -1) {
        configData.inbounds.splice(idx, 1);
        check = this.testConfigSync(configData);
        if (check.ok) {
          Logger.warn(`sing-box validated after stripping ${tag}. Continuing with stable inbounds.`);
          return configData;
        }
      }
    }

    // 4. Ultimate fallback to basic core inbounds
    const coreTags = ['hy2-in', 'vless-ws-in', 'vmess-ws-in', 'vless-hu-in', 'vless-reality-in', 'ss-in'];
    configData.inbounds = configData.inbounds.filter(ib => coreTags.includes(ib.tag));
    check = this.testConfigSync(configData);
    if (check.ok) {
      Logger.warn('sing-box validated with minimum core inbounds (VLESS-WS, VMess-WS, VLESS-HTTPUpgrade).');
      return configData;
    }

    return null;
  }

  start() {
    if (!fs.existsSync(this.paths.singboxBin)) {
      Logger.warn('sing-box executable missing. Core engine skipped.');
      return false;
    }

    // Setup certs
    ensureTlsCertificates(this.paths.certPath, this.paths.keyPath, this.config.sniHy2);
    this.generateRealityKeys();

    let configData = this.buildJsonConfig();
    configData = this.validateAndSanitize(configData);

    if (!configData) {
      Logger.error('sing-box validation failed completely even after auto-fix attempts.');
      return false;
    }

    fs.writeFileSync(this.paths.singboxConfig, JSON.stringify(configData, null, 2), 'utf8');
    Logger.success('sing-box configuration validated.');

    this._spawn();
    this._probeInbounds(configData);
    return true;
  }

  async restart() {
    const old = this.process;
    this._stopping = true;
    if (old && !old.killed) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 5000);
        old.once('exit', () => { clearTimeout(timer); resolve(); });
        try { old.kill('SIGTERM'); } catch (_) { clearTimeout(timer); resolve(); }
      });
    }
    this.process = null;
    this._stopping = false;
    this._restarts = 0;
    return this.start();
  }

  _spawn() {
    try {
      if (fs.existsSync(this.paths.singboxLog) && fs.statSync(this.paths.singboxLog).size > 5 * 1024 * 1024) {
        fs.truncateSync(this.paths.singboxLog, 0);
      }
    } catch (_) {}
    const logFd = fs.openSync(this.paths.singboxLog, 'a');
    this.process = spawn(this.paths.singboxBin, ['run', '-c', this.paths.singboxConfig], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    Logger.info(`sing-box started (pid ${this.process.pid})`);
    // Mirror sing-box output to its log file and surface warnings/errors (rate-limited) in the container log.
    let windowStart = Date.now();
    let printed = 0;
    const onData = (buf) => {
      try { fs.writeSync(logFd, buf); } catch (_) {}
      const text = buf.toString('utf8').replace(/\x1b\[[0-9;]*m/g, '');
      for (const line of text.split('\n')) {
        if (!/FATAL|ERROR|WARN|panic/i.test(line)) continue;
        if (Date.now() - windowStart > 60000) { windowStart = Date.now(); printed = 0; }
        if (++printed <= 15) console.log('[sing-box] ' + line.trim().slice(0, 300));
      }
    };
    this.process.stdout.on('data', onData);
    this.process.stderr.on('data', onData);

    this.process.on('error', (err) => {
      Logger.error(`sing-box process error: ${err.message}`);
    });

    this.process.on('exit', (code, sig) => {
      try { fs.closeSync(logFd); } catch {}
      if (this._stopping) return;
      Logger.warn(`sing-box exited with code ${code} (${sig || 'none'})`);
      this._restarts = (this._restarts || 0) + 1;
      if (this._restarts <= 20) {
        const delay = Math.min(30000, 1000 * this._restarts);
        Logger.warn(`Restarting sing-box in ${delay / 1000}s (attempt ${this._restarts})...`);
        setTimeout(() => { if (!this._stopping) this._spawn(); }, delay);
      } else {
        Logger.error('sing-box keeps crashing; giving up. Check sing-box.log in the data directory.');
      }
    });
  }

  _probeInbounds(configData) {
    const list = (configData.inbounds || []).filter(ib => ib.listen_port && ib.listen === '127.0.0.1');
    setTimeout(() => {
      for (const ib of list) {
        const sock = net.connect(ib.listen_port, '127.0.0.1');
        sock.setTimeout(3000);
        sock.once('connect', () => { Logger.success(`sing-box inbound ${ib.tag} listening on 127.0.0.1:${ib.listen_port}`); sock.destroy(); });
        sock.once('error', (e) => { Logger.error(`sing-box inbound ${ib.tag} NOT listening on :${ib.listen_port} (${e.message})`); });
        sock.once('timeout', () => { Logger.error(`sing-box inbound ${ib.tag} probe timeout on :${ib.listen_port}`); sock.destroy(); });
      }
    }, 2500);
  }

  stop() {
    this._stopping = true;
    if (this.process && !this.process.killed) {
      try {
        this.process.kill('SIGTERM');
      } catch {}
    }
  }
}

// --- Module: lib/engines/xray.js ---
// BK_PROTOCOLS_APPLIED: Xray-core hosts VLESS-XHTTP and Shadowsocks-over-WebSocket (sing-box has no server-side
// transport for Shadowsocks). Both listen on 127.0.0.1 only; the Node mux on PORT routes to them by path.
class XrayEngine {
  constructor(config, stateManager, ports) {
    this.config = config;
    this.paths = config.paths;
    this.stateManager = stateManager;
    this.ports = (ports && typeof ports === 'object') ? ports : { xhttp: ports };
    this.port = this.ports.xhttp || null;
    this.process = null;
  }

  static xhttpPath() {
    return BK_PATHS.xhttp;
  }

  buildConfig() {
    const state = this.stateManager.state;
    const inbounds = [];
    if (this.ports.xhttp) {
      inbounds.push({
        tag: 'vless-xhttp-in',
        listen: '127.0.0.1',
        port: this.ports.xhttp,
        protocol: 'vless',
        settings: { clients: [{ id: state.uuid, level: 0 }], decryption: 'none' },
        streamSettings: {
          network: 'xhttp',
          security: 'none', // TLS (if any) is terminated in front of Xray
          xhttpSettings: { path: XrayEngine.xhttpPath(), mode: 'auto' }
        }
      });
    }
    if (this.ports.ssWs) {
      inbounds.push({
        tag: 'ss-ws-in',
        listen: '127.0.0.1',
        port: this.ports.ssWs,
        protocol: 'shadowsocks',
        settings: { method: this.config.shadowsocks.method || 'aes-256-gcm', password: state.shadowsocksPassword, network: 'tcp' },
        streamSettings: { network: 'ws', security: 'none', wsSettings: { path: BK_PATHS.ssWs } }
      });
    }
    return {
      log: { loglevel: 'warning' },
      inbounds,
      outbounds: [
        { protocol: 'freedom', tag: 'direct' },
        { protocol: 'blackhole', tag: 'block' }
      ]
    };
  }

  start() {
    if (!fs.existsSync(this.paths.xrayBin)) return false;
    if (!this.ports.xhttp && !this.ports.ssWs) return false;
    fs.writeFileSync(this.paths.xrayConfig, JSON.stringify(this.buildConfig(), null, 2), 'utf8');
    try {
      const t = spawnSync(this.paths.xrayBin, ['run', '-test', '-c', this.paths.xrayConfig], { encoding: 'utf8', timeout: 20000 });
      if (t.status !== 0) {
        Logger.error('Xray config test failed: ' + String(t.stdout || t.stderr || '').replace(/\x1b\[[0-9;]*m/g, '').trim().split('\n').slice(-3).join(' | '));
        return false;
      }
    } catch (err) {
      Logger.warn('Xray config test could not run: ' + err.message);
    }
    this._spawn();
    this._probe();
    return true;
  }

  _spawn() {
    try {
      if (fs.existsSync(this.paths.xrayLog) && fs.statSync(this.paths.xrayLog).size > 5 * 1024 * 1024) fs.truncateSync(this.paths.xrayLog, 0);
    } catch (_) {}
    const logFd = fs.openSync(this.paths.xrayLog, 'a');
    this.process = spawn(this.paths.xrayBin, ['run', '-c', this.paths.xrayConfig], { stdio: ['ignore', 'pipe', 'pipe'], detached: false });
    Logger.info(`Xray-core started (pid ${this.process.pid})${this.ports.xhttp ? ', VLESS-XHTTP on 127.0.0.1:' + this.ports.xhttp : ''}${this.ports.ssWs ? ', Shadowsocks-WS on 127.0.0.1:' + this.ports.ssWs : ''}`);
    let windowStart = Date.now();
    let printed = 0;
    const onData = (buf) => {
      try { fs.writeSync(logFd, buf); } catch (_) {}
      const text = buf.toString('utf8').replace(/\x1b\[[0-9;]*m/g, '');
      for (const line of text.split('\n')) {
        if (!/\[(Warning|Error)\]|panic|failed to/i.test(line)) continue;
        if (/is deprecated|Please migrate/i.test(line)) continue;
        if (Date.now() - windowStart > 60000) { windowStart = Date.now(); printed = 0; }
        if (++printed <= 15) console.log('[xray] ' + line.trim().slice(0, 300));
      }
    };
    this.process.stdout.on('data', onData);
    this.process.stderr.on('data', onData);
    this.process.on('error', (err) => Logger.error(`Xray process error: ${err.message}`));
    this.process.on('exit', (code, sig) => {
      try { fs.closeSync(logFd); } catch (_) {}
      if (this._stopping) return;
      Logger.warn(`Xray-core exited with code ${code} (${sig || 'none'})`);
      this._restarts = (this._restarts || 0) + 1;
      if (this._restarts <= 20) {
        const delay = Math.min(30000, 1000 * this._restarts);
        Logger.warn(`Restarting Xray-core in ${delay / 1000}s (attempt ${this._restarts})...`);
        setTimeout(() => { if (!this._stopping) this._spawn(); }, delay);
      } else {
        Logger.error('Xray-core keeps crashing; giving up. See xray.log in the data directory.');
      }
    });
  }

  _probe() {
    setTimeout(() => {
      for (const [tag, port] of [['vless-xhttp-in', this.ports.xhttp], ['ss-ws-in', this.ports.ssWs]]) {
        if (!port) continue;
        const sock = net.connect(port, '127.0.0.1');
        sock.setTimeout(3000);
        sock.once('connect', () => { Logger.success(`xray inbound ${tag} listening on 127.0.0.1:${port}`); sock.destroy(); });
        sock.once('error', (e) => Logger.error(`xray inbound ${tag} NOT listening on :${port} (${e.message})`));
        sock.once('timeout', () => { Logger.error(`xray inbound ${tag} probe timeout on :${port}`); sock.destroy(); });
      }
    }, 2500);
  }

  stop() {
    this._stopping = true;
    if (this.process && !this.process.killed) {
      try { this.process.kill('SIGTERM'); } catch (_) {}
    }
  }
}

// --- Module: lib/engines/argo.js ---
class ArgoTunnel {
  constructor(config, targetPort) {
    this.config = config;
    this.paths = config.paths;
    this.targetPort = targetPort;
    this.process = null;
    this.tunnelDomain = '';
  }

  async discoverDomain(timeoutMs = 45000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      // 1. Try quick tunnel metrics endpoints
      for (const p of [2000, 2001, 2002]) {
        try {
          const resp = await axios.get(`http://127.0.0.1:${p}/quicktunnel`, { timeout: 1500 });
          if (resp.data && resp.data.hostname) {
            return resp.data.hostname.replace(/^https?:\/\//, '').trim().toLowerCase();
          }
        } catch {}
      }

      // 2. Read log file
      if (fs.existsSync(this.paths.cloudflaredLog)) {
        try {
          const logContent = fs.readFileSync(this.paths.cloudflaredLog, 'utf8');
          const match = logContent.match(/https?:\/\/([a-z0-9-]+\.trycloudflare\.com)/i);
          if (match) {
            return match[1].toLowerCase();
          }
        } catch {}
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    return null;
  }

  async start() {
    if (!this.config.enable.argo || !fs.existsSync(this.paths.cloudflaredBin)) {
      return null;
    }

    // Named tunnel
    if (this.config.argo.auth && this.config.argo.domain) {
      this.tunnelDomain = this.config.argo.domain;
      Logger.success(`Cloudflare named tunnel active: ${this.tunnelDomain}`);
      return this.tunnelDomain;
    }

    // Quick tunnel
    Logger.step('Launching Cloudflare Argo Quick Tunnel...');
    const logFd = fs.openSync(this.paths.cloudflaredLog, 'a');

    this.process = spawn(this.paths.cloudflaredBin, [
      'tunnel', '--no-autoupdate', '--metrics', '127.0.0.1:2000',
      '--url', `http://127.0.0.1:${this.targetPort}`
    ], {
      stdio: ['ignore', logFd, logFd],
      detached: false
    });

    this.process.on('exit', () => {
      try { fs.closeSync(logFd); } catch {}
    });

    this.tunnelDomain = await this.discoverDomain();
    if (this.tunnelDomain) {
      Logger.success(`Argo Quick Tunnel ready: ${this.tunnelDomain}`);
    } else {
      Logger.warn('Argo tunnel domain could not be resolved within timeout.');
    }

    return this.tunnelDomain;
  }

  stop() {
    if (this.process && !this.process.killed) {
      try { this.process.kill('SIGTERM'); } catch {}
    }
  }
}

// --- Module: lib/panel/validator.js ---
/**
 * URI and Node validation for client compatibility (v2rayN, v2rayNG, Hiddify, sing-box)
 */

function isLocalAddress(host) {
  if (!host) return true;
  const clean = host.toLowerCase().trim();
  return (
    clean === '127.0.0.1' ||
    clean === 'localhost' ||
    clean === '::1' ||
    clean === '0.0.0.0' ||
    clean.startsWith('127.')
  );
}

/**
 * Validates a node share URI
 * @param {object} node Node object containing uri, type, name
 * @param {object} options { allowLocalHostLinks, compatMode }
 * @returns {boolean}
 */
function isValidNode(node, options = {}) {
  if (!node || !node.uri || typeof node.uri !== 'string') return false;

  const { allowLocalHostLinks = false, compatMode = 'v2ray' } = options;
  const uri = node.uri.trim();

  try {
    // Check scheme
    const scheme = uri.split('://')[0].toLowerCase();

    // Special handling for vmess:// (base64 JSON)
    if (scheme === 'vmess') {
      try {
        const rawJson = Buffer.from(uri.replace(/^vmess:\/\//i, ''), 'base64').toString('utf8');
        const vConf = JSON.parse(rawJson);
        if (!vConf.add || !vConf.port || !vConf.id) return false;
        if (!allowLocalHostLinks && isLocalAddress(vConf.add)) return false;
        return true;
      } catch {
        return false;
      }
    }

    const parsed = new URL(uri);

    // Check host
    if (!allowLocalHostLinks && isLocalAddress(parsed.hostname)) {
      return false;
    }

    // Compat mode filter
    if (compatMode === 'v2ray') {
      const allowedSchemes = ['vless', 'vmess', 'trojan', 'ss'];
      if (!allowedSchemes.includes(scheme)) {
        return false;
      }
    }

    // Protocol-specific checks
    if (scheme === 'vless') {
      const uuid = parsed.username;
      if (!uuid || uuid.length < 8) return false;

      const security = parsed.searchParams.get('security');
      if (security === 'reality') {
        const pbk = parsed.searchParams.get('pbk');
        const sid = parsed.searchParams.get('sid');
        const sni = parsed.searchParams.get('sni');
        // Valid REALITY requires pbk, sid, and sni
        if (!pbk || !sid || !sni) return false;
      }

      const type = parsed.searchParams.get('type');
      if (type === 'ws') {
        const pathVal = parsed.searchParams.get('path');
        if (!pathVal) return false;
      }

      if (type === 'grpc') {
        const serviceName = parsed.searchParams.get('serviceName');
        if (!serviceName) return false;
      }

      // In v2ray-compat mode, avoid experimental/incompatible transports
      // BK_PROTOCOLS_APPLIED: httpupgrade / xhttp are supported by current v2rayN / v2rayNG (Xray-core), keep them.
    }

    if (scheme === 'trojan') {
      if (!parsed.username) return false;
    }

    if (scheme === 'ss') {
      if (!parsed.username && !parsed.hostname) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// --- Module: lib/panel/links.js ---
/**
 * Link and subscription configuration generator for Blue Knight Gate
 */



function urlSafeEncode(str) {
  return encodeURIComponent(str);
}

function yamlSafeQuote(str) {
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function deriveX25519PublicKey(privBase64) {
  try {
    if (!privBase64 || typeof privBase64 !== 'string') return null;
    const privBuf = Buffer.from(privBase64.trim(), 'base64');
    if (privBuf.length !== 32) return null;
    const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b656e04220420', 'hex'), privBuf]);
    const keyObj = crypto.createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
    return crypto.createPublicKey(keyObj).export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  } catch {
    return null;
  }
}

class LinkGenerator {
  constructor(config, state, resolvedHost) {
    this.config = config;
    this.state = state;
    this.host = config.forceHost || resolvedHost || config.domain || '127.0.0.1';
    // BK_FIX2_APPLIED
    const bkOnRailway = bkOnEdgeHost(); // Replit or Railway: only HTTPS on 443 is public
    this.port = parseInt(process.env.LINK_PORT || '', 10) || config.publicPort;
    // Railway's edge only accepts HTTPS on 443 and forwards plain HTTP to $PORT, so on Railway every
    // WS/HTTPUpgrade link is TLS (edge-side) and plain "security=none" links are not generated.
    // LINK_TLS=true|false overrides the detection.
    this.edgeTls = false; // VLESS-only build: all generated links are security=none.
    // Railway's edge serves a valid public certificate: never ask clients to skip verification there
    // (Xray-core >= 26.x removed allowInsecure; links carrying it can fail to load in new clients).
    this.insecure = !this.edgeTls;
    this.tlsOpt = LinkGenerator.tlsOptions((config.forceHost && config.domain) ? config.domain : this.host);
    this.prefix = config.nodePrefix || 'BK-';
    this.wsPath = BK_PATHS.vlessWs;
    this.vmessPath = BK_PATHS.vmessWs;
    this.huPath = BK_PATHS.vlessHu;
    this.vmHuPath = BK_PATHS.vmessHu;
    this.trHuPath = BK_PATHS.trojanHu;
    this.xhPath = BK_PATHS.xhttp;
    this.trPath = BK_PATHS.trojanWs;
    this.ssWsPath = BK_PATHS.ssWs;
    this.grpcService = BK_PATHS.grpcService;
    // BK_PROTOCOLS_APPLIED: self-signed certificate -> pin it. Xray-core >= 26.2 refuses "allowInsecure" and needs
    // pinnedPeerCertSha256 (share-link "pcs"); LINK_ALLOW_INSECURE=false drops allowInsecure for new clients only.
    this.pcs = (this.insecure && config.paths && config.paths.certPath) ? bkCertSha256(config.paths.certPath) : '';
    this.keepAllowInsecure = this.insecure && !/^(0|false|no|off)$/i.test(String(process.env.LINK_ALLOW_INSECURE || ''));
    this.name = (t) => (config.nodePrefix || '') + t;
  }

  /** Readable host for Host headers: the TLS/WS host override if set, else the link host. */
  get plainHost() { return normalizeHost(process.env.LINK_HOST) || this.host; }

  /**
   * TLS client options for share links / subscriptions (env driven):
   *   LINK_FP      uTLS fingerprint, default chrome (chrome|firefox|safari|edge|ios|android|random|randomized|360|qq; "none" = omit)
   *   LINK_ALPN    comma list, default http/1.1 ("none" = omit). WebSocket needs http/1.1.
   *   TLS_CIPHERS  comma list of cipher suite names -> only sing-box subscription tls.cipher_suites
   *   LINK_SNI     override SNI (default: DOMAIN / Railway domain)
   *   LINK_HOST    override WS/HTTPUpgrade Host header (default: SNI)
   */
  static tlsOptions(defaultSni) {
    const env = process.env;
    const warnOnce = (k, m) => { LinkGenerator._warned = LinkGenerator._warned || {}; if (!LinkGenerator._warned[k]) { LinkGenerator._warned[k] = 1; Logger.warn(m); } };
    const FP = ['chrome', 'firefox', 'safari', 'edge', 'ios', 'android', 'random', 'randomized', '360', 'qq'];
    let fp = env.LINK_FP === undefined ? 'chrome' : String(env.LINK_FP).trim().toLowerCase();
    if (fp === 'none' || fp === 'off' || fp === 'false') fp = '';
    if (fp && !FP.includes(fp)) { warnOnce('fp', 'LINK_FP="' + fp + '" is not supported; using chrome. Allowed: ' + FP.join(', ') + ', none'); fp = 'chrome'; }
    const alpnRaw = env.LINK_ALPN === undefined ? 'http/1.1' : String(env.LINK_ALPN).trim();
    const alpn = /^(none|off|false)?$/i.test(alpnRaw) ? [] : alpnRaw.split(',').map(x => x.trim()).filter(Boolean);
    if (alpn.includes('h2') || alpn.includes('h3')) warnOnce('alpn', 'LINK_ALPN contains h2/h3: WebSocket links only work over http/1.1.');
    const CIPHERS = [
      'TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256', 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384', 'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', 'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA', 'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256', 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256',
      'TLS_RSA_WITH_AES_128_GCM_SHA256', 'TLS_RSA_WITH_AES_256_GCM_SHA384', 'TLS_RSA_WITH_AES_128_CBC_SHA', 'TLS_RSA_WITH_AES_256_CBC_SHA'
    ];
    const ciphers = [];
    for (const c of String(env.TLS_CIPHERS || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean)) {
      if (CIPHERS.includes(c)) { if (!ciphers.includes(c)) ciphers.push(c); } else warnOnce('c_' + c, 'TLS_CIPHERS: unknown cipher suite "' + c + '" ignored.');
    }
    const sni = normalizeHost(env.LINK_SNI) || defaultSni;
    const wsHost = normalizeHost(env.LINK_HOST) || sni;
    return { fp, alpn, ciphers, sni, wsHost };
  }

  /** "&sni=..&fp=..&alpn=.." for vless:// and trojan:// links (no non-standard cipher field). */
  _uriTls() {
    const o = this.tlsOpt;
    let q = '&sni=' + encodeURIComponent(o.sni);
    if (o.fp) q += '&fp=' + encodeURIComponent(o.fp);
    if (o.alpn.length) q += '&alpn=' + encodeURIComponent(o.alpn.join(','));
    q += this._uriInsecure();
    return q;
  }

  /** "&allowInsecure=1&pcs=<sha256>" for the self-signed certificate (nothing when the edge has a real cert). */
  _uriInsecure() {
    let q = '';
    if (this.keepAllowInsecure) q += '&allowInsecure=1';
    if (this.pcs) q += '&pcs=' + this.pcs;
    return q;
  }

  _sbTls() {
    const o = this.tlsOpt;
    const t = { enabled: true, server_name: o.sni, insecure: this.insecure };
    if (o.alpn.length) t.alpn = o.alpn.slice();
    if (o.fp) t.utls = { enabled: true, fingerprint: o.fp };
    if (o.ciphers.length) t.cipher_suites = o.ciphers.slice();
    return t;
  }

  _clashTls(obj, sniKey = 'servername') {
    const o = this.tlsOpt;
    obj.tls = true;
    obj[sniKey] = o.sni;
    obj['skip-cert-verify'] = this.insecure;
    if (this.pcs) obj.fingerprint = this.pcs; // mihomo: pin the self-signed certificate
    if (o.fp) obj['client-fingerprint'] = o.fp === 'randomized' ? 'random' : o.fp;
    if (o.alpn.length) obj.alpn = o.alpn.slice();
    return obj;
  }

  generateHysteria2() {
    return null; // Hysteria removed as requested
  }

  generateVlessWs() {
    if (!this.config.enable.vlessWs) return null;
    if (this.edgeTls) return null;
    const userIndex = this._vlessNodeIndex || 1;
    const userPath = `${this.wsPath}-u${userIndex}`;
    const customUserName = Array.isArray(this.state.vlessUserNames) ? String(this.state.vlessUserNames[userIndex - 1] || '').trim() : '';
    const name = this.name('VLESS-WS-' + userIndex + (customUserName ? '-' + customUserName : ''));
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      network: 'ws',
      tls: false,
      'ws-opts': { path: userPath, headers: { Host: this.host } }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      transport: { type: 'ws', path: userPath, headers: { Host: this.host } }
    };
    return {
      name,
      type: 'VLESS-WS',
      label: `VLESS WebSocket User ${userIndex}`,
      compat: true,
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=ws&host=${this.host}&path=${urlSafeEncode(userPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVlessWsTls() {
    if (!this.config.enable.vlessWsTls) return null;
    const name = '💞t.me/BlueKnight_Net - WS-TLS';
    const o = this.tlsOpt;
    const clashProxy = this._clashTls({
      name, type: 'vless', server: this.host, port: this.port, uuid: this.state.uuid, network: 'ws',
      'ws-opts': { path: this.wsPath, headers: { Host: o.wsHost } }
    });
    const sbOutbound = {
      type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid,
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.wsPath, headers: { Host: o.wsHost } }
    };
    return {
      name,
      type: 'VLESS-WS-TLS',
      label: 'CDN Cloudflare Compatible',
      compat: true,
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.wsPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVmessWsTls() {
    if (!this.config.enable.vmessWsTls) return null;
    const name = '💞t.me/BlueKnight_Net - VMess-WS-TLS';
    const o = this.tlsOpt;
    const vmessConfig = {
      v: '2', ps: name, add: this.host, port: String(this.port), id: this.state.uuid, aid: '0', scy: 'auto',
      net: 'ws', type: 'none', host: o.wsHost, path: this.vmessPath, tls: 'tls', sni: o.sni
    };
    if (o.alpn.length) vmessConfig.alpn = o.alpn.join(',');
    if (o.fp) vmessConfig.fp = o.fp;
    if (this.keepAllowInsecure) vmessConfig.allowInsecure = true;
    if (this.pcs) vmessConfig.pcs = this.pcs;
    const uri = 'vmess://' + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
    const clashProxy = this._clashTls({
      name, type: 'vmess', server: this.host, port: this.port, uuid: this.state.uuid, alterId: 0, cipher: 'auto', network: 'ws',
      'ws-opts': { path: this.vmessPath, headers: { Host: o.wsHost } }
    });
    const sbOutbound = {
      type: 'vmess', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid, alter_id: 0, security: 'auto',
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.vmessPath, headers: { Host: o.wsHost } }
    };
    return {
      name,
      type: 'VMess-WS-TLS',
      label: 'Classic Universal Client',
      compat: true,
      uri,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVmessWs() {
    if (!this.config.enable.vmessWs) return null;
    if (this.edgeTls) return null; // covered by VMess-WS-TLS (same inbound)
    const name = '💞t.me/BlueKnight_Net - VMess-WS';
    const vmessConfig = {
      v: '2',
      ps: name,
      add: this.host,
      port: String(this.port),
      id: this.state.uuid,
      aid: '0',
      scy: 'auto',
      net: 'ws',
      type: 'none',
      host: this.host,
      path: this.vmessPath,
      tls: 'none'
    };
    const uri = 'vmess://' + Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
    const clashProxy = {
      name,
      type: 'vmess',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      alterId: 0,
      cipher: 'auto',
      network: 'ws',
      tls: false,
      'ws-opts': {
        path: this.vmessPath,
        headers: { Host: this.host }
      }
    };
    const sbOutbound = {
      type: 'vmess',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      alter_id: 0,
      security: 'auto',
      transport: {
        type: 'ws',
        path: this.vmessPath,
        headers: { Host: this.host }
      }
    };
    return {
      name,
      type: 'VMess-WS',
      label: 'VMess WebSocket Direct',
      compat: true,
      uri,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  // ===== BK_PROTOCOLS_APPLIED: HTTPUpgrade for VLESS / VMess / Trojan (one generic builder) =====
  _httpUpgradeNode(proto, enabled, pathVal, type) {
    if (!enabled) return null;
    const tls = this.edgeTls; // Replit/Railway edge: TLS on 443; self-hosted: plain on PORT
    const o = this.tlsOpt;
    const hostHdr = tls ? o.wsHost : this.plainHost;
    const name = this.name(type + (tls ? '-TLS' : '') + '-' + (this._vlessNodeIndex || 1));
    const u = this.state.uuid;
    const base = { server: this.host, port: this.port };
    let uri; let clash; let sb;
    const clashWs = { network: 'ws', 'ws-opts': { path: pathVal, headers: { Host: hostHdr }, 'v2ray-http-upgrade': true } };
    const sbTransport = { type: 'httpupgrade', path: pathVal, host: hostHdr };
    if (proto === 'vless') {
      uri = `vless://${u}@${this.host}:${this.port}?encryption=none&security=${tls ? 'tls' + this._uriTls() : 'none'}&type=httpupgrade&host=${encodeURIComponent(hostHdr)}&path=${urlSafeEncode(pathVal)}#${urlSafeEncode(name)}`;
      clash = { name, type: 'vless', ...base, uuid: u, ...clashWs };
      sb = { type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: u, transport: sbTransport };
    } else if (proto === 'vmess') {
      const v = { v: '2', ps: name, add: this.host, port: String(this.port), id: u, aid: '0', scy: 'auto', net: 'httpupgrade', type: 'none', host: hostHdr, path: pathVal, tls: tls ? 'tls' : '' };
      if (tls) { v.sni = o.sni; if (o.alpn.length) v.alpn = o.alpn.join(','); if (o.fp) v.fp = o.fp; }
      uri = 'vmess://' + Buffer.from(JSON.stringify(v)).toString('base64');
      clash = { name, type: 'vmess', ...base, uuid: u, alterId: 0, cipher: 'auto', ...clashWs };
      sb = { type: 'vmess', tag: name, server: this.host, server_port: this.port, uuid: u, alter_id: 0, security: 'auto', transport: sbTransport };
    } else {
      uri = `trojan://${u}@${this.host}:${this.port}?security=${tls ? 'tls' + this._uriTls() : 'none'}&type=httpupgrade&host=${encodeURIComponent(hostHdr)}&path=${urlSafeEncode(pathVal)}#${urlSafeEncode(name)}`;
      clash = { name, type: 'trojan', ...base, password: u, ...clashWs };
      sb = { type: 'trojan', tag: name, server: this.host, server_port: this.port, password: u, transport: sbTransport };
    }
    if (tls) { this._clashTls(clash, proto === 'trojan' ? 'sni' : 'servername'); sb.tls = this._sbTls(); } else { clash.tls = false; }
    if (proto === 'trojan' && !tls) clash = null; // Clash Meta (mihomo) always wraps Trojan in TLS: no plain-Trojan entry
    return {
      name, type: type + (tls ? '-TLS' : ''), label: type.replace('-', ' '), compat: true, uri, clash,
      singboxOutbound: [sb], singboxJson: JSON.stringify([sb], null, 2)
    };
  }

  generateVlessHttpUpgrade() { const userIndex = this._vlessNodeIndex || 5; return this._httpUpgradeNode('vless', this.config.enable.vlessHttpUpgrade, `${this.huPath}-u${userIndex}`, 'VLESS-HTTPUpgrade'); }
  generateVmessHttpUpgrade() { return this._httpUpgradeNode('vmess', this.config.enable.vmessHttpUpgrade, this.vmHuPath, 'VMess-HTTPUpgrade'); }
  generateTrojanHttpUpgrade() { return this._httpUpgradeNode('trojan', this.config.enable.trojanHttpUpgrade, this.trHuPath, 'Trojan-HTTPUpgrade'); }

  /** Trojan-WS-TLS on a self-hosted port: TLS is terminated by the gate's internal HTTPS server (self-signed cert). */
  generateTrojanWsTls() {
    if (!this.config.enable.trojanWsTls || !this.config.enable.trojanWs) return null; // served by the Trojan-WS inbound
    if (this.edgeTls) return null; // generateTrojanWs() already emits Trojan-WS-TLS behind an edge
    const name = this.name('Trojan-WS-TLS');
    const o = this.tlsOpt;
    const sbOutbound = {
      type: 'trojan', tag: name, server: this.host, server_port: this.port, password: this.state.uuid,
      tls: this._sbTls(),
      transport: { type: 'ws', path: this.trPath, headers: { Host: o.wsHost } }
    };
    return {
      name, type: 'Trojan-WS-TLS', label: 'Trojan WebSocket TLS', compat: true,
      uri: `trojan://${this.state.uuid}@${this.host}:${this.port}?security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.trPath)}#${urlSafeEncode(name)}`,
      clash: this._clashTls({
        name, type: 'trojan', server: this.host, port: this.port, password: this.state.uuid, network: 'ws',
        'ws-opts': { path: this.trPath, headers: { Host: o.wsHost } }
      }, 'sni'),
      singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** VLESS + gRPC + TLS (ALPN h2 only) on the shared port. Not possible behind Replit/Railway (edge speaks HTTP/1.1 to the app). */
  generateVlessGrpcTls() {
    if (!this.config.enable.vlessGrpcTls || this.edgeTls) return null;
    const name = this.name('VLESS-gRPC-TLS');
    const o = this.tlsOpt;
    const svc = this.grpcService;
    let q = '&sni=' + encodeURIComponent(o.sni) + (o.fp ? '&fp=' + encodeURIComponent(o.fp) : '') + '&alpn=h2' + this._uriInsecure();
    const sbTls = { enabled: true, server_name: o.sni, insecure: this.insecure, alpn: ['h2'] };
    if (o.fp) sbTls.utls = { enabled: true, fingerprint: o.fp };
    const sbOutbound = { type: 'vless', tag: name, server: this.host, server_port: this.port, uuid: this.state.uuid, tls: sbTls, transport: { type: 'grpc', service_name: svc } };
    const clash = { name, type: 'vless', server: this.host, port: this.port, uuid: this.state.uuid, network: 'grpc', tls: true, servername: o.sni, 'skip-cert-verify': this.insecure, alpn: ['h2'], 'grpc-opts': { 'grpc-service-name': svc } };
    if (this.pcs) clash.fingerprint = this.pcs;
    if (o.fp) clash['client-fingerprint'] = o.fp === 'randomized' ? 'random' : o.fp;
    return {
      name, type: 'VLESS-gRPC-TLS', label: 'gRPC TLS', compat: true,
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${q}&type=grpc&serviceName=${urlSafeEncode(svc)}&mode=gun#${urlSafeEncode(name)}`,
      clash, singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** Shadowsocks over WebSocket (SIP002 + v2ray-plugin "websocket" mode, mux off) served by Xray-core. */
  generateShadowsocksWs() {
    if (!this.config.enable.ssWs || !this.config.ssWsPort || !this.state.shadowsocksPassword) return null;
    if (this.edgeTls) return null; // kept to self-hosted ports (plain WS); behind an edge use the VLESS/VMess/Trojan TLS links
    const name = this.name('Shadowsocks-WS');
    const method = this.config.shadowsocks.method || 'aes-256-gcm';
    const pass = this.state.shadowsocksPassword;
    const hostHdr = this.plainHost;
    const userinfo = /^2022-/i.test(method)
      ? encodeURIComponent(method) + ':' + encodeURIComponent(pass)
      : Buffer.from(`${method}:${pass}`).toString('base64url');
    const pluginOpts = `mode=websocket;host=${hostHdr};path=${this.ssWsPath};mux=0`;
    const sbOutbound = { type: 'shadowsocks', tag: name, server: this.host, server_port: this.port, method, password: pass, plugin: 'v2ray-plugin', plugin_opts: pluginOpts };
    return {
      name, type: 'Shadowsocks-WS', label: 'Shadowsocks + v2ray-plugin (WebSocket)', compat: true,
      uri: `ss://${userinfo}@${this.host}:${this.port}/?plugin=${encodeURIComponent('v2ray-plugin;' + pluginOpts)}#${urlSafeEncode(name)}`,
      clash: { name, type: 'ss', server: this.host, port: this.port, cipher: method, password: pass, plugin: 'v2ray-plugin', 'plugin-opts': { mode: 'websocket', host: hostHdr, path: this.ssWsPath, tls: false, mux: false } },
      singboxOutbound: [sbOutbound], singboxJson: JSON.stringify([sbOutbound], null, 2),
      note: 'Shadowsocks + v2ray-plugin (websocket, mux=0): v2rayN / v2rayNG / Hiddify / sing-box / Clash Meta'
    };
  }

  generateReality() {
    if (!this.config.enable.reality) return null;
    if (!this.state.realityPublicKey || !this.state.realityPrivateKey || this.state.realityPublicKey.length < 10) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        this.state.realityPrivateKey = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64url');
        this.state.realityPublicKey = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64url');
        this.state.realityShortId = this.state.realityShortId || crypto.randomBytes(4).toString('hex');
      } catch (_) {
        return null;
      }
    }
    const name = '💞t.me/BlueKnight_Net - Reality';
    const target = String(this.config.reality.target || 'www.microsoft.com').replace(/[\[\]]/g, '').trim();
    const shortId = this.state.realityShortId || '12345678';
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      flow: 'xtls-rprx-vision',
      tls: true,
      'reality-opts': {
        'public-key': this.state.realityPublicKey,
        'short-id': shortId
      },
      'client-fingerprint': 'chrome',
      servername: target
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      flow: 'xtls-rprx-vision',
      tls: {
        enabled: true,
        server_name: target,
        reality: {
          enabled: true,
          public_key: this.state.realityPublicKey,
          short_id: shortId
        },
        utls: { enabled: true, fingerprint: 'chrome' }
      }
    };
    return {
      name,
      type: 'VLESS-REALITY',
      label: 'Anti-blocking / Web traffic',
      compat: true,
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=reality&sni=${target}&fp=chrome&pbk=${this.state.realityPublicKey}&sid=${shortId}&type=tcp&flow=xtls-rprx-vision#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateShadowTls() {
    if (!this.config.enable.shadowTlsVless || !this.state.shadowTlsPassword) return null;
    const name = '💞t.me/BlueKnight_Net - ShadowTLS';
    const sni = String(this.config.shadowTls.sni || 'www.microsoft.com').replace(/[\[\]]/g, '').trim();
    const clashProxy = {
      name,
      type: 'shadow-tls',
      server: this.host,
      port: this.port,
      password: this.state.shadowTlsPassword,
      version: 3,
      sni
    };
    const sbOutbounds = [
      {
        type: 'shadowtls',
        tag: name,
        server: this.host,
        server_port: this.port,
        version: 3,
        password: this.state.shadowTlsPassword,
        tls: {
          enabled: true,
          server_name: sni
        },
        detour: `${name}-detour`
      },
      {
        type: 'vless',
        tag: `${name}-detour`,
        server: this.host,
        server_port: this.port,
        uuid: this.state.uuid
      }
    ];
    return {
      name,
      type: 'ShadowTLS-VLESS',
      compat: false, // shadowtls:// is not recognized by v2rayN/v2rayNG
      uri: `shadowtls://${this.state.shadowTlsPassword}@${this.host}:${this.port}?sni=${sni}&version=3#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: sbOutbounds,
      singboxJson: JSON.stringify(sbOutbounds, null, 2),
      note: 'Use Hiddify, sing-box, or Clash Meta'
    };
  }

  generateShadowsocks() {
    if (!this.config.enable.shadowsocks || !this.state.shadowsocksPassword) return null;
    const name = '💞t.me/BlueKnight_Net - Shadowsocks';
    const method = this.config.shadowsocks.method || 'aes-256-gcm';
    const auth = Buffer.from(`${method}:${this.state.shadowsocksPassword}`).toString('base64');
    const clashProxy = {
      name,
      type: 'ss',
      server: this.host,
      port: this.port,
      cipher: method,
      password: this.state.shadowsocksPassword
    };
    const sbOutbound = {
      type: 'shadowsocks',
      tag: name,
      server: this.host,
      server_port: this.port,
      method,
      password: this.state.shadowsocksPassword
    };
    return {
      name,
      type: 'Shadowsocks',
      compat: true,
      uri: `ss://${auth}@${this.host}:${this.port}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  _getOrGenerateWgKeys() {
    let clientPriv = this.state && this.state.wireguardClientPrivateKey;
    let clientPub = this.state && this.state.wireguardClientPublicKey;
    let serverPriv = this.state && this.state.wireguardPrivateKey;
    let serverPub = this.state && this.state.wireguardPublicKey;

    const isValidBase64Key = (k) => typeof k === 'string' && k.trim().length >= 40;

    if (!isValidBase64Key(clientPriv)) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        clientPriv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        clientPub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (_) {
        const raw = crypto.randomBytes(32);
        raw[0] &= 248; raw[31] &= 127; raw[31] |= 64;
        clientPriv = raw.toString('base64');
        clientPub = deriveX25519PublicKey(clientPriv) || crypto.randomBytes(32).toString('base64');
      }
    } else {
      const derived = deriveX25519PublicKey(clientPriv);
      if (derived) clientPub = derived;
    }

    if (!isValidBase64Key(serverPriv)) {
      try {
        const kp = crypto.generateKeyPairSync('x25519');
        serverPriv = kp.privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
        serverPub = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
      } catch (_) {
        const raw = crypto.randomBytes(32);
        raw[0] &= 248; raw[31] &= 127; raw[31] |= 64;
        serverPriv = raw.toString('base64');
        serverPub = deriveX25519PublicKey(serverPriv) || crypto.randomBytes(32).toString('base64');
      }
    } else {
      const derived = deriveX25519PublicKey(serverPriv);
      if (derived) serverPub = derived;
    }

    if (this.state) {
      this.state.wireguardClientPrivateKey = clientPriv;
      this.state.wireguardClientPublicKey = clientPub;
      this.state.wireguardPrivateKey = serverPriv;
      this.state.wireguardPublicKey = serverPub;
    }

    return { clientPriv, clientPub, serverPub };
  }

  generateWireGuard() {
    try {
      if (!this.config || !this.config.enable || !this.config.enable.wireguard) return null;

      const keys = this._getOrGenerateWgKeys();
      const clientPrivateKey = keys.clientPriv;
      const serverPublicKey = keys.serverPub;

      if (!clientPrivateKey || !serverPublicKey) return null;

      const name = '💞t.me/BlueKnight_Net - WireGuard';
      const port = (this.config.wireguard && this.config.wireguard.port) || this.port || 51820;
      const clientIp = (this.config.wireguard && this.config.wireguard.clientIp) || '10.66.66.2/32';
      const ifaceAddress = clientIp.endsWith('/32') ? clientIp.replace('/32', '/24') : clientIp;
      const mtu = (this.config.wireguard && this.config.wireguard.mtu) || 1420;

      const wgConf = [
        '[Interface]',
        `PrivateKey = ${clientPrivateKey}`,
        `Address = ${ifaceAddress}`,
        'DNS = 1.1.1.1, 8.8.8.8',
        `MTU = ${mtu}`,
        '',
        '[Peer]',
        `PublicKey = ${serverPublicKey}`,
        `Endpoint = ${this.host}:${port}`,
        'AllowedIPs = 0.0.0.0/0, ::/0',
        'PersistentKeepalive = 25'
      ].join('\n') + '\n';

      const clashProxy = {
        name,
        type: 'wireguard',
        server: this.host,
        port,
        ip: clientIp.replace(/\/.*$/, ''),
        'public-key': serverPublicKey,
        'private-key': clientPrivateKey,
        udp: true,
        'remote-dns-resolve': true,
        dns: ['1.1.1.1', '8.8.8.8'],
        mtu
      };

      const sbOutbound = {
        type: 'wireguard',
        tag: name,
        server: this.host,
        server_port: port,
        local_address: [clientIp],
        private_key: clientPrivateKey,
        peer_public_key: serverPublicKey,
        mtu
      };

      const rawUri = `wireguard://${encodeURIComponent(clientPrivateKey)}@${this.host}:${port}?publickey=${encodeURIComponent(serverPublicKey)}&address=${encodeURIComponent(clientIp)}&mtu=${mtu}#${urlSafeEncode(name)}`;

      return {
        name,
        type: 'WireGuard',
        compat: false,
        uri: rawUri,
        wgConf,
        clash: clashProxy,
        singboxOutbound: [sbOutbound],
        singboxJson: JSON.stringify([sbOutbound], null, 2),
        note: 'WireGuard .conf / Clash Meta / Sing-box'
      };
    } catch (err) {
      console.warn(`[WARN] WireGuard generation failed: ${err.message}. Skipping.`);
      return null;
    }
  }

  generateTuic() {
    if (!this.config.enable.tuic) return null;
    const name = '💞t.me/BlueKnight_Net - TUIC';
    const port = this.config.tuic.port || 8443;
    const sni = this.config.sniHy2 || 'www.google.com';
    const cc = this.config.tuic.congestionController || 'bbr';

    const clashProxy = {
      name,
      type: 'tuic',
      server: this.host,
      port,
      uuid: this.state.uuid,
      password: this.state.uuid,
      alpn: ['h3'],
      sni,
      'skip-cert-verify': true,
      'congestion-controller': cc,
      udp: true
    };

    const sbOutbound = {
      type: 'tuic',
      tag: name,
      server: this.host,
      server_port: port,
      uuid: this.state.uuid,
      password: this.state.uuid,
      congestion_controller: cc,
      tls: {
        enabled: true,
        server_name: sni,
        alpn: ['h3'],
        insecure: true
      }
    };

    return {
      name,
      type: 'TUIC',
      compat: false,
      uri: `tuic://${this.state.uuid}:${this.state.uuid}@${this.host}:${port}?congestion_control=${cc}&alpn=h3&sni=${sni}&allow_insecure=1#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  /** XHTTP link options: XHTTP_MODE (default packet-up), XHTTP_ALPN (default h2 - Railway edge negotiates h2; Xray's xhttp client must match the edge ALPN). */
  static xhttpOptions() {
    const MODES = ['auto', 'packet-up', 'stream-up', 'stream-one'];
    let mode = String(process.env.XHTTP_MODE || 'packet-up').trim().toLowerCase();
    if (!MODES.includes(mode)) mode = 'packet-up';
    const raw = process.env.XHTTP_ALPN === undefined ? 'h2' : String(process.env.XHTTP_ALPN).trim();
    const alpn = /^(none|off|false)?$/i.test(raw) ? [] : raw.split(',').map(x => x.trim()).filter(Boolean);
    return { mode, alpn };
  }

  generateXhttp() {
    if (!this.config.enable.vlessXhttp) return null;
    if (this.config.xhttpPort === null) return null; // Xray-core failed to start
    if (this.edgeTls) {
      const name = '💞t.me/BlueKnight_Net - XHTTP-TLS';
      const o = this.tlsOpt;
      const x = LinkGenerator.xhttpOptions();
      let q = '&sni=' + encodeURIComponent(o.sni);
      if (o.fp) q += '&fp=' + encodeURIComponent(o.fp);
      if (x.alpn.length) q += '&alpn=' + encodeURIComponent(x.alpn.join(','));
      return {
        name,
        type: 'VLESS-XHTTP-TLS',
        label: 'VLESS-XHTTP-TLS',
        note: 'VLESS-XHTTP-TLS (Xray clients: v2rayNG, v2rayN, Hiddify w/ xray core)',
        compat: true, // v2ray subscription only; no Clash / sing-box outbound (unsupported there)
        uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=tls${q}&type=xhttp&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.xhPath)}&mode=${x.mode}#${urlSafeEncode(name)}`,
        clash: null
      };
    }
    const name = this.name('VLESS-XHTTP');
    return {
      name,
      type: 'VLESS-XHTTP',
      label: 'VLESS XHTTP',
      note: 'VLESS-XHTTP (Xray-core clients: v2rayN, v2rayNG, Hiddify w/ xray core)',
      compat: true, // BK_PROTOCOLS_APPLIED: listed in the normal subscription too (Xray clients support xhttp)
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=xhttp&host=${encodeURIComponent(this.plainHost)}&path=${urlSafeEncode(this.xhPath)}&mode=packet-up#${urlSafeEncode(name)}`,
      clash: null
    };
  }

  generateArgo(argoDomain) {
    if (!this.config.enable.argo || !argoDomain) return null;
    const name = '💞t.me/BlueKnight_Net - Argo';
    const clashProxy = {
      name,
      type: 'vless',
      server: argoDomain,
      port: 443,
      uuid: this.state.uuid,
      network: 'ws',
      tls: true,
      servername: argoDomain,
      'ws-opts': {
        path: this.wsPath,
        headers: { Host: argoDomain }
      }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: argoDomain,
      server_port: 443,
      uuid: this.state.uuid,
      tls: {
        enabled: true,
        server_name: argoDomain
      },
      transport: {
        type: 'ws',
        path: this.wsPath,
        headers: { Host: argoDomain }
      }
    };
    return {
      name,
      type: 'VLESS-Argo',
      compat: true,
      uri: `vless://${this.state.uuid}@${argoDomain}:443?encryption=none&security=tls&sni=${argoDomain}&type=ws&host=${argoDomain}&path=${urlSafeEncode(this.wsPath)}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateTrojanWs() {
    if (!this.config.enable.trojanWs) return null;
    if (this.edgeTls) {
      const name = '💞t.me/BlueKnight_Net - Trojan-WS-TLS';
      const o = this.tlsOpt;
      const sbOutbound = {
        type: 'trojan', tag: name, server: this.host, server_port: this.port, password: this.state.uuid,
        tls: this._sbTls(),
        transport: { type: 'ws', path: this.trPath, headers: { Host: o.wsHost } }
      };
      return {
        name,
        type: 'Trojan-WS-TLS',
        label: 'Trojan WebSocket TLS',
        compat: true,
        uri: `trojan://${this.state.uuid}@${this.host}:${this.port}?security=tls${this._uriTls()}&type=ws&host=${encodeURIComponent(o.wsHost)}&path=${urlSafeEncode(this.trPath)}#${urlSafeEncode(name)}`,
        clash: this._clashTls({
          name, type: 'trojan', server: this.host, port: this.port, password: this.state.uuid, network: 'ws',
          'ws-opts': { path: this.trPath, headers: { Host: o.wsHost } }
        }, 'sni'),
        singboxOutbound: [sbOutbound],
        singboxJson: JSON.stringify([sbOutbound], null, 2)
      };
    }
    const name = '💞t.me/BlueKnight_Net - Trojan-WS';
    const trPath = this.trPath;
    const clashProxy = {
      name,
      type: 'trojan',
      server: this.host,
      port: this.port,
      password: this.state.uuid,
      network: 'ws',
      tls: false,
      'ws-opts': {
        path: trPath,
        headers: { Host: this.host }
      }
    };
    const sbOutbound = {
      type: 'trojan',
      tag: name,
      server: this.host,
      server_port: this.port,
      password: this.state.uuid,
      transport: {
        type: 'ws',
        path: trPath,
        headers: { Host: this.host }
      }
    };
    return {
      name,
      type: 'Trojan-WS',
      label: 'Trojan WebSocket Direct',
      compat: true,
      uri: `trojan://${this.state.uuid}@${this.host}:${this.port}?security=none&type=ws&host=${this.host}&path=${urlSafeEncode(trPath)}#${urlSafeEncode(name)}`,
      clash: null, // BK_PROTOCOLS_APPLIED: mihomo always uses TLS for Trojan (the entry could never connect); use Trojan-WS-TLS there
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateTrojanGrpcTls() {
    if (!this.config.enable.trojanGrpcTls) return null;
    const name = '💞t.me/BlueKnight_Net - gRPC';
    const sni = this.config.domain || this.host;
    const serviceName = this.grpcService;
    const clashProxy = {
      name,
      type: 'trojan',
      server: this.host,
      port: this.port,
      password: this.state.uuid,
      network: 'grpc',
      tls: true,
      sni: sni,
      'skip-cert-verify': true,
      alpn: ['h2'],
      'grpc-opts': {
        'grpc-service-name': serviceName
      }
    };
    const sbOutbound = {
      type: 'trojan',
      tag: name,
      server: this.host,
      server_port: this.port,
      password: this.state.uuid,
      tls: {
        enabled: true,
        server_name: sni,
        alpn: ['h2'],
        insecure: true
      },
      transport: {
        type: 'grpc',
        service_name: serviceName
      }
    };
    return {
      name,
      type: 'Trojan-gRPC-TLS',
      label: 'CDN gRPC Alternative',
      compat: true,
      uri: `trojan://${this.state.uuid}@${this.host}:${this.port}?security=tls&sni=${sni}&alpn=h2&type=grpc&serviceName=${urlSafeEncode(serviceName)}&fp=chrome${this._uriInsecure()}#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  generateVlessGrpc() {
    if (!this.config.enable.vlessGrpc) return null;
    if (this.edgeTls) return null; // BK_PROTOCOLS_APPLIED: an HTTP/1.1 edge (Replit/Railway) cannot carry h2c gRPC
    const name = this.name('VLESS-gRPC');
    const serviceName = this.grpcService;
    const clashProxy = {
      name,
      type: 'vless',
      server: this.host,
      port: this.port,
      uuid: this.state.uuid,
      network: 'grpc',
      tls: false,
      'grpc-opts': {
        'grpc-service-name': serviceName
      }
    };
    const sbOutbound = {
      type: 'vless',
      tag: name,
      server: this.host,
      server_port: this.port,
      uuid: this.state.uuid,
      transport: {
        type: 'grpc',
        service_name: serviceName
      }
    };
    return {
      name,
      type: 'VLESS-gRPC',
      label: 'gRPC Direct',
      compat: true,
      uri: `vless://${this.state.uuid}@${this.host}:${this.port}?encryption=none&security=none&type=grpc&serviceName=${urlSafeEncode(serviceName)}&mode=gun#${urlSafeEncode(name)}`,
      clash: clashProxy,
      singboxOutbound: [sbOutbound],
      singboxJson: JSON.stringify([sbOutbound], null, 2)
    };
  }

  getAllNodes(options = {}) {
    let argoDomain = null;
    let compat = 'v2ray';
    let allowLocalHost = this.config.allowLocalHostLinks || false;

    if (typeof options === 'string') {
      argoDomain = options;
    } else if (options && typeof options === 'object') {
      argoDomain = options.argoDomain || null;
      if (options.compat) compat = options.compat;
      if (options.allowLocalHostLinks !== undefined) allowLocalHost = options.allowLocalHostLinks;
    }

    const all = [];
    const ids = Array.isArray(this.state.vlessUuids) ? this.state.vlessUuids : [this.state.uuid];
    const originalUuid = this.state.uuid;
    try {
      ids.forEach((uuid, index) => {
        if (!uuid) return;
        this.state.uuid = uuid;
        this._vlessNodeIndex = index + 1;
        const node = this.generateVlessWs();
        if (node) all.push(node);
      });
    } finally {
      this.state.uuid = originalUuid;
      this._vlessNodeIndex = 0;
    }

    return all.filter(node => isValidNode(node, { allowLocalHostLinks: allowLocalHost, compatMode: compat }));
  }

  buildClashMetaYaml(nodes) {
    const proxyLines = [];
    const proxyNames = [];

    for (const node of nodes) {
      if (!node.clash) continue;
      proxyNames.push(node.clash.name);
      proxyLines.push(`  - name: ${yamlSafeQuote(node.clash.name)}`);
      proxyLines.push(`    type: ${node.clash.type}`);
      proxyLines.push(`    server: ${yamlSafeQuote(node.clash.server)}`);
      proxyLines.push(`    port: ${node.clash.port}`);
      if (node.clash.fingerprint) proxyLines.push(`    fingerprint: ${yamlSafeQuote(node.clash.fingerprint)}`);
      if (node.clash.plugin) {
        proxyLines.push(`    plugin: ${node.clash.plugin}`);
        const po = node.clash['plugin-opts'] || {};
        proxyLines.push(`    plugin-opts:`);
        for (const [k, v] of Object.entries(po)) proxyLines.push(`      ${k}: ${typeof v === 'string' ? yamlSafeQuote(v) : v}`);
      }

      if (node.clash.password) proxyLines.push(`    password: ${yamlSafeQuote(node.clash.password)}`);
      if (node.clash.uuid) proxyLines.push(`    uuid: ${yamlSafeQuote(node.clash.uuid)}`);
      if (node.clash.alterId !== undefined) proxyLines.push(`    alterId: ${node.clash.alterId}`);
      if (node.clash.sni) proxyLines.push(`    sni: ${yamlSafeQuote(node.clash.sni)}`);
      if (node.clash.servername) proxyLines.push(`    servername: ${yamlSafeQuote(node.clash.servername)}`);
      if (node.clash['skip-cert-verify'] !== undefined) proxyLines.push(`    skip-cert-verify: ${node.clash['skip-cert-verify']}`);
      if (node.clash.obfs) proxyLines.push(`    obfs: ${node.clash.obfs}`);
      if (node.clash['obfs-password']) proxyLines.push(`    obfs-password: ${yamlSafeQuote(node.clash['obfs-password'])}`);
      if (node.clash.alpn) proxyLines.push(`    alpn: [${node.clash.alpn.map(yamlSafeQuote).join(', ')}]`);
      if (node.clash.network) proxyLines.push(`    network: ${node.clash.network}`);
      if (node.clash.tls !== undefined) proxyLines.push(`    tls: ${node.clash.tls}`);
      if (node.clash.flow) proxyLines.push(`    flow: ${node.clash.flow}`);
      if (node.clash['client-fingerprint']) proxyLines.push(`    client-fingerprint: ${node.clash['client-fingerprint']}`);

      if (node.clash.ip) proxyLines.push(`    ip: ${yamlSafeQuote(node.clash.ip)}`);
      if (node.clash['public-key']) proxyLines.push(`    public-key: ${yamlSafeQuote(node.clash['public-key'])}`);
      if (node.clash['private-key']) proxyLines.push(`    private-key: ${yamlSafeQuote(node.clash['private-key'])}`);
      if (node.clash.udp !== undefined) proxyLines.push(`    udp: ${node.clash.udp}`);
      if (node.clash['remote-dns-resolve'] !== undefined) proxyLines.push(`    remote-dns-resolve: ${node.clash['remote-dns-resolve']}`);
      if (node.clash.dns) proxyLines.push(`    dns: [${node.clash.dns.map(yamlSafeQuote).join(', ')}]`);
      if (node.clash.mtu) proxyLines.push(`    mtu: ${node.clash.mtu}`);
      if (node.clash['congestion-controller']) proxyLines.push(`    congestion-controller: ${yamlSafeQuote(node.clash['congestion-controller'])}`);

      if (node.clash['reality-opts']) {
        proxyLines.push(`    reality-opts:`);
        proxyLines.push(`      public-key: ${yamlSafeQuote(node.clash['reality-opts']['public-key'])}`);
        proxyLines.push(`      short-id: ${yamlSafeQuote(node.clash['reality-opts']['short-id'])}`);
      }

      if (node.clash['ws-opts']) {
        proxyLines.push(`    ws-opts:`);
        proxyLines.push(`      path: ${yamlSafeQuote(node.clash['ws-opts'].path)}`);
        if (node.clash['ws-opts'].headers) {
          proxyLines.push(`      headers:`);
          for (const [k, v] of Object.entries(node.clash['ws-opts'].headers)) {
            proxyLines.push(`        ${k}: ${yamlSafeQuote(v)}`);
          }
        }
        if (node.clash['ws-opts']['v2ray-http-upgrade']) proxyLines.push(`      v2ray-http-upgrade: true`);
      }

      if (node.clash['httpupgrade-opts']) {
        proxyLines.push(`    httpupgrade-opts:`);
        proxyLines.push(`      path: ${yamlSafeQuote(node.clash['httpupgrade-opts'].path)}`);
        proxyLines.push(`      host: ${yamlSafeQuote(node.clash['httpupgrade-opts'].host)}`);
      }

      if (node.clash['grpc-opts']) {
        proxyLines.push(`    grpc-opts:`);
        proxyLines.push(`      grpc-service-name: ${yamlSafeQuote(node.clash['grpc-opts']['grpc-service-name'])}`);
      }

      if (node.clash.cipher) proxyLines.push(`    cipher: ${node.clash.cipher}`);
      if (node.clash.version) proxyLines.push(`    version: ${node.clash.version}`);
    }

    const proxiesBlock = proxyLines.join('\n');
    const proxyListStr = proxyNames.map(name => `      - ${yamlSafeQuote(name)}`).join('\n');

    return `# Blue Knight Gate - Clash Meta (Mihomo) Subscription
# Channel: Blue Knight Net (https://t.me/BlueKnight_Net)
port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info

proxies:
${proxiesBlock}

proxy-groups:
  - name: "🛡️ Blue Knight Net"
    type: select
    proxies:
      - "⚡ Auto Select"
${proxyListStr}

  - name: "⚡ Auto Select"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
${proxyListStr}

rules:
  - MATCH,"🛡️ Blue Knight Net"
`;
  }

  buildSingBoxClientJson(nodes) {
    const outbounds = [];
    const proxyTags = [];

    for (const node of nodes) {
      if (node.singboxOutbound && Array.isArray(node.singboxOutbound)) {
        for (const ob of node.singboxOutbound) {
          outbounds.push(ob);
        }
        proxyTags.push(node.name);
      }
    }

    const allOutbounds = [];

    if (proxyTags.length > 0) {
      allOutbounds.push(
        {
          type: 'selector',
          tag: '🛡️ Blue Knight Net',
          outbounds: ['⚡ Auto Select', ...proxyTags]
        },
        {
          type: 'urltest',
          tag: '⚡ Auto Select',
          outbounds: [...proxyTags],
          url: 'http://www.gstatic.com/generate_204',
          interval: '5m'
        }
      );
    }

    allOutbounds.push(...outbounds);
    allOutbounds.push({ type: 'direct', tag: 'direct' }); // BK_PROTOCOLS_APPLIED: no legacy "block" outbound (removed in sing-box 1.13)

    return JSON.stringify({
      log: { level: 'info' },
      outbounds: allOutbounds
    }, null, 2);
  }
}

// --- Module: lib/panel/http-panel.js ---
function createHttpPanel(config, stateManager, engineStatusGetter, resolvedHostGetter, runtime = {}) {
  // No website or management panel is exposed. This HTTP server exists only because
  // TcpRouter uses it as the internal HTTP/HTTPS endpoint for protocol routing.
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res) => { res.status(404).end(); });
  const server = http.createServer(app);
  return { server, app };
}

const BkTraffic = (() => {
  let KEYS = ['VLESS-WS', 'VMess-WS', 'Trojan-WS', 'VLESS-XHTTP', 'VLESS-HTTPUpgrade', ...Array.from({ length: 4 }, (_, i) => `VLESS-WS-${i + 1}`), ...Array.from({ length: 4 }, (_, i) => `VLESS-HTTPUpgrade-${i + 5}`), 'VMess-HTTPUpgrade', 'Trojan-HTTPUpgrade', 'VLESS-gRPC', 'Shadowsocks-WS', 'Other'];
  const GIB = 1024 * 1024 * 1024;
  const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
  const utcMonth = (d = new Date()) => d.toISOString().slice(0, 7);
  let file = null; let st = null; let dirty = false; let lastSave = 0; let writable = false;
  const live = { up: 0, down: 0 }; let samples = [];
  const active = {};
  const warned = {};
  const fresh = () => ({ v: 1, since: new Date().toISOString(), allTime: {}, day: { key: utcDay(), per: {} }, month: { key: utcMonth(), per: {}, baseBytes: 0 } });
  const norm = (label) => (KEYS.includes(label) || /^VLESS-WS-\d+$/.test(String(label)) ? label : 'Other');
  const bump = (bucket, k, up, down) => { const e = bucket[k] || (bucket[k] = { up: 0, down: 0 }); e.up += up; e.down += down; };
  const sum = (per) => { let up = 0; let down = 0; for (const k of Object.keys(per || {})) { up += per[k].up || 0; down += per[k].down || 0; } return { up, down, total: up + down }; };
  const limitBytes = () => { const g = parseFloat(process.env.TRAFFIC_LIMIT_GB || ''); return isFinite(g) && g > 0 ? g * GIB : 0; };
  function roll() {
    if (!st) return;
    const d = utcDay(); const m = utcMonth();
    if (st.day.key !== d) { st.day = { key: d, per: {} }; dirty = true; }
    if (st.month.key !== m) { st.month = { key: m, per: {}, baseBytes: 0 }; dirty = true; for (const k of Object.keys(warned)) delete warned[k]; }
  }
  function save() {
    if (!file || !st) return;
    try {
      const tmp = file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(st), 'utf8');
      fs.renameSync(tmp, file);
      dirty = false; lastSave = Date.now(); writable = true;
    } catch (err) { writable = false; if (!warned.save) { warned.save = 1; Logger.warn('Could not save traffic.json: ' + err.message); } }
  }
  function checkLimit() {
    const lim = limitBytes(); if (!lim) return;
    const used = sum(st.month.per).total + (st.month.baseBytes || 0);
    const pct = used / lim * 100;
    if (pct >= 100 && !warned.p100) { warned.p100 = 1; warned.p80 = 1; Logger.warn(`Traffic: 100% of TRAFFIC_LIMIT_GB used this month (estimate). Check Replit -> Account -> Usage.`); }
    else if (pct >= 80 && !warned.p80) { warned.p80 = 1; Logger.warn(`Traffic: 80% of TRAFFIC_LIMIT_GB used this month (estimate).`); }
  }
  function tick() {
    const now = Date.now();
    samples.push({ t: now, up: live.up, down: live.down });
    if (samples.length > 6) samples.shift();
    roll();
    if (dirty && now - lastSave > 30000) { save(); checkLimit(); }
  }
  return {
    get KEYS() { return KEYS; },
    register(label) { if (/^VLESS-WS-\d+$/.test(String(label)) && !KEYS.includes(label)) KEYS.push(label); },
    remove(label) { KEYS = KEYS.filter(k => k !== label); if (st) { delete st.allTime[label]; delete st.day.per[label]; delete st.month.per[label]; delete active[label]; dirty = true; save(); } },
    init(dataDir) {
      file = path.join(dataDir, 'traffic.json');
      try { st = JSON.parse(fs.readFileSync(file, 'utf8')); if (!st || st.v !== 1) st = fresh(); } catch (_) { st = fresh(); }
      st.allTime = st.allTime || {}; st.day = st.day || { key: utcDay(), per: {} }; st.month = st.month || { key: utcMonth(), per: {}, baseBytes: 0 };
      roll(); save();
      const t = setInterval(tick, 1000); if (t.unref) t.unref();
      process.once('exit', () => { try { save(); } catch (_) {} });
      const lim = limitBytes();
      Logger.info(`Traffic meter: ${file}${lim ? ` (limit ${(lim / GIB).toFixed(2)} GiB/month)` : ''}`);
    },
    add(label, up, down) {
      if (!st || (!up && !down)) return;
      const k = norm(label);
      bump(st.allTime, k, up, down); bump(st.day.per, k, up, down); bump(st.month.per, k, up, down);
      live.up += up; live.down += down; dirty = true;
    },
    /** Count bytes of a proxied duplex pair: client->backend = upload, backend->client = download. */
    meter(label, client, backend) {
      const k = norm(label);
      active[k] = (active[k] || 0) + 1;
      let done = false;
      const end = () => { if (!done) { done = true; active[k] = Math.max(0, (active[k] || 1) - 1); } };
      client.on('data', (b) => this.add(k, b.length, 0));
      backend.on('data', (b) => this.add(k, 0, b.length));
      client.once('close', end); backend.once('close', end);
    },
    open(label) { const k = norm(label); active[k] = (active[k] || 0) + 1; let done = false; return () => { if (!done) { done = true; active[k] = Math.max(0, (active[k] || 1) - 1); } }; },
    save,
    reset() { st = fresh(); for (const k of Object.keys(warned)) delete warned[k]; save(); },
    setMonthUsedGB(gb) { roll(); st.month.baseBytes = Math.round(gb * GIB) - sum(st.month.per).total; dirty = true; save(); checkLimit(); },
    snapshot() {
      if (!st) return { ok: false, error: 'not started' };
      roll();
      let upBps = 0; let downBps = 0;
      if (samples.length >= 2) { const a = samples[0]; const b = samples[samples.length - 1]; const dt = (b.t - a.t) / 1000; if (dt > 0) { upBps = (b.up - a.up) / dt; downBps = (b.down - a.down) / dt; } }
      const month = sum(st.month.per); const base = st.month.baseBytes || 0;
      const lim = limitBytes(); const used = month.total + base;
      const n = new Date(); const next = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1));
      return {
        ok: true, keys: KEYS, now: n.toISOString(), since: st.since, persisted: writable, file: path.basename(file || ''),
        day: { key: st.day.key, per: st.day.per, ...sum(st.day.per) },
        month: { key: st.month.key, per: st.month.per, ...month, baseBytes: base, used, resetsAt: next.toISOString() },
        allTime: { per: st.allTime, ...sum(st.allTime) },
        live: { upBps, downBps }, active: { ...active },
        limit: lim ? { bytes: lim, used, remaining: Math.max(0, lim - used), pct: used / lim * 100, level: used >= lim ? 'over' : (used >= lim * 0.8 ? 'warn' : 'ok') } : null
      };
    }
  };
})();

class TcpRouter {
  constructor(config, targetPorts, expressServer, expressApp) {
    this.config = config;
    this.ports = targetPorts;
    this.httpServer = expressServer;
    this.expressApp = expressApp || (expressServer && expressServer.listeners('request')[0]);
    this.server = null;
    this.httpsServer = null;
    this.internalHttpsPort = null;
  }

  pipeToBackend(clientSocket, firstChunk, targetPort, label) {
    clientSocket.setTimeout(0);
    clientSocket.setKeepAlive(true, 10000);
    clientSocket.setNoDelay(true);

    const backend = net.connect(targetPort, '127.0.0.1', () => {
      backend.setTimeout(0);
      backend.setKeepAlive(true, 10000);
      backend.setNoDelay(true);
      backend.write(firstChunk);
      if (label !== 'Internal-HTTPS') { // decrypted WS / HTTPUpgrade / XHTTP traffic is metered inside the HTTPS server
        BkTraffic.add(label, firstChunk ? firstChunk.length : 0, 0);
        BkTraffic.meter(label, clientSocket, backend);
      }
      clientSocket.pipe(backend);
      backend.pipe(clientSocket);
      clientSocket.resume();
    });

    backend.on('error', (err) => {
      const now = Date.now();
      if (!this._lastWarns) this._lastWarns = {};
      if (!this._lastWarns[label] || now - this._lastWarns[label] > 15000) {
        Logger.warn(`TCP Router: ${label} backend on :${targetPort} unreachable (${err.message})`);
        this._lastWarns[label] = now;
      }
      try { clientSocket.destroy(); } catch {}
    });

    clientSocket.on('error', () => {
      try { backend.destroy(); } catch {}
    });
  }

  attachUpgradeHandlers(server) {
    server.on('upgrade', (req, socket, head) => {
      socket.setTimeout(0);
      socket.setKeepAlive(true, 10000);
      socket.setNoDelay(true);

      let url = req.url || '';
      try { url = decodeURIComponent(url.split('?')[0]); } catch (_) { url = url.split('?')[0]; }
      // BK_PROTOCOLS_APPLIED: exact path routing (longest path first, so ".../vmess-hu" never matches ".../vmess").
      const pp = this.config.panelPath;
      const routes = [];
      const wsPorts = this.ports.vlessWsUsers || [];
      for (let portIndex = 0; portIndex < wsPorts.length; portIndex++) {
        const userNo = portIndex + 1;
        routes.push([`${BK_PATHS.vlessWs}-u${userNo}`, `/${pp}-ws-${userNo}`, wsPorts[portIndex], `VLESS-WS-${userNo}`]);
      }
      for (let i = 5; i <= 8; i++) {
        routes.push([`${BK_PATHS.vlessHu}-u${i}`, `/${pp}-hu-${i}`, this.ports.vlessHuUsers && this.ports.vlessHuUsers[i - 5], `VLESS-HTTPUpgrade-${i}`]);
      }
      routes.push(
        [BK_PATHS.vmessWs, `/${pp}-vmess`, this.ports.vmessWs, 'VMess-WS'],
        [BK_PATHS.trojanWs, `/${pp}-trojan`, this.ports.trojanWs, 'Trojan-WS'],
        [BK_PATHS.vmessHu, `/${pp}-vmess-hu`, this.ports.vmessHu, 'VMess-HTTPUpgrade'],
        [BK_PATHS.trojanHu, `/${pp}-trojan-hu`, this.ports.trojanHu, 'Trojan-HTTPUpgrade'],
        [BK_PATHS.xhttp, `/${pp}-xh`, this.config.xhttpPort, 'VLESS-XHTTP'],
        [BK_PATHS.ssWs, `/${pp}-ss`, this.config.ssWsPort, 'Shadowsocks-WS']
      );
      const hit = (p) => url === p || url.startsWith(p + '/');

      let destPort = null;
      let label = 'Unknown Upgrade';
      for (const [branded, legacy, port, lbl] of routes) {
        if (hit(branded) || hit(legacy)) { if (port) { destPort = port; label = lbl; } break; }
      }

      this._upgradeCount = (this._upgradeCount || 0) + 1;
      if (this._upgradeCount <= 20 || !destPort) {
        Logger.info(`WS upgrade #${this._upgradeCount} ${label} path=${url.slice(0, 80)} host=${req.headers.host || '-'}${destPort ? ' -> :' + destPort : ' -> 404 (no route)'}`);
      }

      if (!destPort) {
        socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }

      const backend = net.connect(destPort, '127.0.0.1', () => {
        backend.setTimeout(0);
        backend.setKeepAlive(true, 10000);
        backend.setNoDelay(true);

        let headersStr = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          headersStr += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
        }
        headersStr += '\r\n';

        backend.write(headersStr);
        if (head && head.length > 0) {
          backend.write(head);
        }

        BkTraffic.add(label, head && head.length ? head.length : 0, 0);
        BkTraffic.meter(label, socket, backend);
        socket.pipe(backend);
        backend.pipe(socket);
      });

      let bkConnected = false;
      backend.once('connect', () => { bkConnected = true; });
      backend.on('error', (err) => {
        if (!bkConnected) {
          const now = Date.now();
          if (!this._lastUpErr || now - this._lastUpErr > 15000) {
            this._lastUpErr = now;
            Logger.error(`${label} backend :${destPort} unreachable (${err.message}) - is sing-box running? See sing-box.log`);
          }
          try { socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); } catch {}
        }
        try { socket.destroy(); } catch {}
      });

      socket.on('error', () => {
        try { backend.destroy(); } catch {}
      });
      socket.on('close', () => { try { backend.destroy(); } catch {} });
      backend.on('close', () => { try { socket.destroy(); } catch {} });
    });
  }

  async setupInternalHttps() {
    // BK_PROTOCOLS_APPLIED: one internal TLS terminator for everything TLS on the shared port:
    //   ALPN http/1.1 -> Express panel / subscription + WS / HTTPUpgrade / XHTTP upgrades (as before)
    //   ALPN h2       -> per-stream router: gRPC service path -> sing-box VLESS-gRPC (h2c), anything else -> panel
    // (Xray clients with a uTLS fingerprint offer "h2,http/1.1" for gRPC exactly like a browser, so the choice
    //  has to be made per HTTP/2 stream, not from the ClientHello.)
    try {
      const certs = ensureTlsCertificates(this.config.paths.certPath, this.config.paths.keyPath, this.config.domain || 'localhost');
      if (!certs || !certs.cert || !certs.key) return;

      const handler = this.expressApp || (this.httpServer && this.httpServer.listeners('request')[0]);
      this.h1Server = http.createServer(handler);
      this.h1Server.keepAliveTimeout = 120000;
      this.h1Server.headersTimeout = 125000;
      this.h1Server.requestTimeout = 0;
      this.h1Server.timeout = 0;
      this.attachUpgradeHandlers(this.h1Server);

      const grpcBackend = this.config.enable.vlessGrpcTls && this.ports.vlessGrpc;
      if (grpcBackend) this._setupH2Router();

      this.httpsServer = tls.createServer({
        cert: certs.cert,
        key: certs.key,
        ALPNProtocols: grpcBackend ? ['h2', 'http/1.1'] : ['http/1.1']
      }, (sock) => {
        sock.on('error', () => {});
        if (sock.alpnProtocol === 'h2' && this.h2Server) this.h2Server.emit('connection', sock);
        else this.h1Server.emit('connection', sock);
      });
      this.httpsServer.on('tlsClientError', () => {});

      await new Promise((resolve) => {
        this.httpsServer.listen(0, '127.0.0.1', () => {
          this.internalHttpsPort = this.httpsServer.address().port;
          Logger.item('Internal HTTPS Port', this.internalHttpsPort);
          resolve();
        });
        this.httpsServer.on('error', (err) => {
          Logger.warn(`Internal HTTPS server failed to start: ${err.message}`);
          resolve();
        });
      });
    } catch (err) {
      Logger.warn(`Internal HTTPS setup error: ${err.message}`);
    }
  }

  _setupH2Router() {
    const HOP = new Set(['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'host', 'http2-settings', 'te']);
    const grpcPrefix = '/' + BK_PATHS.grpcService + '/';
    const big = { initialWindowSize: 4 * 1024 * 1024, maxFrameSize: 64 * 1024 };
    this.h2Server = http2.createServer({ settings: big });
    this.h2Server.on('session', (session) => {
      session.on('error', () => {});
      try { session.setLocalWindowSize(16 * 1024 * 1024); } catch (_) {}
      session.on('close', () => { if (session._bkBackend) { try { session._bkBackend.close(); } catch (_) {} } });
    });
    const backendFor = (session) => {
      let be = session._bkBackend;
      if (be && !be.closed && !be.destroyed) return be;
      be = http2.connect(`http://127.0.0.1:${this.ports.vlessGrpc}`, { settings: big });
      be.on('error', () => {});
      be.on('connect', () => { try { be.setLocalWindowSize(16 * 1024 * 1024); } catch (_) {} });
      session._bkBackend = be;
      return be;
    };
    this.h2Server.on('stream', (stream, headers) => {
      stream.on('error', () => {});
      const p = String(headers[':path'] || '/');
      const fwd = {};
      for (const k of Object.keys(headers)) if (!k.startsWith(':') && !HOP.has(k)) fwd[k] = headers[k];

      if (p.startsWith(grpcPrefix)) {
        let up;
        try {
          up = backendFor(stream.session).request({ ...fwd, ':method': headers[':method'] || 'POST', ':path': p, ':scheme': 'http', ':authority': headers[':authority'] || '127.0.0.1', te: 'trailers' }, { endStream: false });
        } catch (_) { try { stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR); } catch (__) {} return; }
        let trailers = null;
        up.on('error', () => { try { stream.close(http2.constants.NGHTTP2_INTERNAL_ERROR); } catch (_) {} });
        up.on('response', (rh) => {
          const out = { ':status': rh[':status'] || 200 };
          for (const k of Object.keys(rh)) if (!k.startsWith(':') && !HOP.has(k)) out[k] = rh[k];
          try { stream.respond(out, { waitForTrailers: true }); } catch (_) { return; }
          BkTraffic.meter('VLESS-gRPC', stream, up);
          up.pipe(stream);
        });
        up.on('trailers', (t) => { trailers = t; });
        stream.on('wantTrailers', () => {
          const t = {};
          if (trailers) for (const k of Object.keys(trailers)) if (!k.startsWith(':')) t[k] = trailers[k];
          if (!Object.keys(t).length) t['grpc-status'] = '0';
          try { stream.sendTrailers(t); } catch (_) {}
        });
        stream.pipe(up);
        stream.on('close', () => { if (!up.closed) { try { up.close(); } catch (_) {} } });
        up.on('close', () => { if (!stream.closed && !stream.headersSent) { try { stream.close(); } catch (_) {} } });
        return;
      }

      // A browser (or other HTTP/2 client) that is not gRPC: relay the request to the panel over HTTP/1.1.
      fwd.host = headers[':authority'] || 'localhost';
      fwd['x-forwarded-proto'] = 'https';
      const rq = http.request({ host: '127.0.0.1', port: this.config.publicPort, method: headers[':method'] || 'GET', path: p, headers: fwd, agent: false });
      rq.on('response', (r) => {
        const out = { ':status': r.statusCode };
        for (const [k, v] of Object.entries(r.headers)) if (!HOP.has(k)) out[k] = v;
        try { stream.respond(out); } catch (_) { r.destroy(); return; }
        r.pipe(stream);
      });
      rq.on('error', () => { try { if (!stream.headersSent) stream.respond({ ':status': 502 }); stream.end(); } catch (_) {} });
      stream.pipe(rq);
    });
  }

  async start() {
    this.httpServer.keepAliveTimeout = 120000;
    this.httpServer.headersTimeout = 125000;
    this.attachUpgradeHandlers(this.httpServer);

    await this.setupInternalHttps();

    this.server = net.createServer((socket) => {
      socket.setTimeout(0);
      socket.setKeepAlive(true, 10000);
      socket.setNoDelay(true);

      // BK_PROTOCOLS_APPLIED: a TLS ClientHello (esp. with post-quantum key shares, ~1.8 KB) often arrives split
      // over several TCP segments; wait for the whole first record so SNI / ALPN routing sees every extension.
      let pending = null;
      let waitTimer = null;
      const onFirstData = (data) => {
        pending = pending ? Buffer.concat([pending, data]) : data;
        const needMore = (pending[0] === 0x16 && pending[1] === 0x03 && pending.length >= 5 && pending.length < Math.min(pending.readUInt16BE(3) + 5, 16389))
          || (pending.length < 16 && 'PRI * HTTP/2.0\r\n'.startsWith(pending.toString('latin1')));
        if (needMore) {
          if (!waitTimer) waitTimer = setTimeout(() => { socket.removeListener('data', onFirstData); socket.pause(); route(pending); }, 1500);
          return;
        }
        if (waitTimer) clearTimeout(waitTimer);
        socket.removeListener('data', onFirstData);
        socket.pause();
        route(pending);
      };
      socket.on('data', onFirstData);
      const route = (chunk) => {

        // 1. SOCKS5 check (byte 0x05)
        if (this.config.enable.socks && this.ports.socks && chunk.length >= 2 && chunk[0] === 0x05) {
          this.pipeToBackend(socket, chunk, this.ports.socks, 'SOCKS5');
          return;
        }

        // 2. TLS ClientHello check (0x16 0x03)
        if (chunk.length >= 3 && chunk[0] === 0x16 && chunk[1] === 0x03) {
          const { sni, alpn } = parseClientHello(chunk);
          let target = null;

          // Priority 1: Reality target SNI
          if (this.config.enable.reality && this.ports.reality && sni === this.config.reality.target) {
            target = { port: this.ports.reality, label: 'REALITY' };
          }
          // Priority 2: ShadowTLS SNI (if explicitly enabled)
          else if (this.config.enable.shadowTlsVless && this.ports.shadowTls && sni === this.config.shadowTls.sni) {
            target = { port: this.ports.shadowTls, label: 'ShadowTLS-VLESS' };
          }
          // Priority 3: gRPC over TLS. gRPC clients offer ONLY "h2"; browsers / WS / HTTPUpgrade clients offer
          // "http/1.1" (often together with h2), so they still reach the internal HTTPS server below.
          // (BK_PROTOCOLS_APPLIED: previously any ClientHello containing h2 - e.g. every browser - went to gRPC.)
          else if (alpn && alpn.includes('h2') && !alpn.includes('http/1.1') && this.config.enable.vlessGrpcTls && this.ports.vlessGrpcTls) {
            target = { port: this.ports.vlessGrpcTls, label: 'VLESS-gRPC' };
          }
          else if (alpn && alpn.includes('h2') && !alpn.includes('http/1.1') && this.config.enable.trojanGrpcTls && this.ports.trojanGrpcTls) {
            target = { port: this.ports.trojanGrpcTls, label: 'Trojan-gRPC-TLS' };
          }
          // Priority 4: Internal HTTPS server (handles VLESS-WS-TLS, VMess-WS-TLS, HTTPS Sub, HTTPS Panel)
          else if (this.internalHttpsPort) {
            target = { port: this.internalHttpsPort, label: 'Internal-HTTPS' };
          }
          // Priority 5: Fallback to vlessWsTls if singbox port is open
          else if (this.config.enable.vlessWsTls && this.ports.vlessWsTls) {
            target = { port: this.ports.vlessWsTls, label: 'VLESS-WS-TLS' };
          }
          // Priority 6: Reality decoy fallback
          else if (this.config.enable.reality && this.ports.reality) {
            target = { port: this.ports.reality, label: 'REALITY-Decoy' };
          }

          if (target) {
            this.pipeToBackend(socket, chunk, target.port, target.label);
            return;
          }
        }

        // 3. HTTP Proxy check (CONNECT or absolute URL)
        if (this.config.enable.httpProxy && this.ports.httpProxy) {
          const headerSnippet = chunk.toString('latin1', 0, Math.min(chunk.length, 256));
          if (/^CONNECT /i.test(headerSnippet) || /^(GET|POST|HEAD) https?:\/\//i.test(headerSnippet)) {
            this.pipeToBackend(socket, chunk, this.ports.httpProxy, 'HTTP-Proxy');
            return;
          }
        }

        // 4. gRPC check (HTTP/2 cleartext connection preface)
        if (this.config.enable.vlessGrpc && this.ports.vlessGrpc && chunk.length >= 16) {
          if (chunk.toString('latin1', 0, 16) === 'PRI * HTTP/2.0\r\n') {
            this.pipeToBackend(socket, chunk, this.ports.vlessGrpc, 'VLESS-gRPC');
            return;
          }
        }

        // 5. Shadowsocks check: raw encrypted stream doesn't look like standard HTTP verbs
        const firstWords = chunk.toString('latin1', 0, Math.min(chunk.length, 8));
        const isHttpVerb = /^(GET|POST|PUT|HEAD|OPTIONS|DELETE|PATCH|TRACE) /i.test(firstWords);

        if (!isHttpVerb && this.config.enable.shadowsocks && this.ports.shadowsocks) {
          this.pipeToBackend(socket, chunk, this.ports.shadowsocks, 'Shadowsocks');
          return;
        }

        // 6. Fallback: Hand off to internal HTTP server (Express panel & WS upgrades)
        socket.unshift(chunk);
        this.httpServer.emit('connection', socket);
        socket.resume();
      };

      socket.on('error', () => {});
    });

    return new Promise((resolve, reject) => {
      this.server.listen(this.config.publicPort, '0.0.0.0', () => {
        Logger.success(`Public TCP multiplexer listening on 0.0.0.0:${this.config.publicPort}`);
        resolve(this.server);
      });
      this.server.on('error', reject);
    });
  }

  stop() {
    if (this.server) {
      try { this.server.close(); } catch {}
    }
    if (this.httpsServer) {
      try { this.httpsServer.close(); } catch {}
    }
  }
}

// --- Module: lib/boot.js ---
async function resolvePublicHost(config, savedHost) {
  if (config.forceHost) return config.forceHost;
  const explicitDomain = normalizeHost(process.env.DOMAIN || process.env.SB_DOMAIN || '');
  if (savedHost && !explicitDomain && !bkIsPlatformHost(savedHost)) { Logger.info(`Using public domain saved from an earlier panel visit: ${savedHost}`); return savedHost; }
  if (config.domain) return config.domain;
  if (savedHost && !savedHost.endsWith('.replit.dev')) { Logger.info(`Using public domain saved from an earlier panel visit: ${savedHost}`); return savedHost; }
  if (bkOnReplit()) {
    if (!process.env.REPLIT_DEPLOYMENT) {
      Logger.warn('Running in the Replit editor: the *.replit.dev URL is private and cannot be used for configs.');
      Logger.warn('Publish the app (Reserved VM or Autoscale) and open https://<name>.replit.app/knight (or your Worker address).');
    } else {
      Logger.warn('No public domain found in REPLIT_DOMAINS: links use the domain you open the panel with (saved automatically).');
    }
  } else if (bkOnRailway()) {
    Logger.warn('No public domain yet: Railway -> Settings -> Networking -> Generate Domain (port 8080 / the port Railway suggests).');
    Logger.warn('No redeploy or variable needed: links use the domain you open the panel with (it is saved automatically).');
  }
  if (process.env.CFIP) return process.env.CFIP;
  if (process.env.DOMAIN || process.env.SB_DOMAIN) return process.env.DOMAIN || process.env.SB_DOMAIN;

  try {
    const res = await axios.get('https://api.ipify.org?format=text', { timeout: 3500 });
    if (res.data && typeof res.data === 'string' && res.data.trim()) {
      return res.data.trim();
    }
  } catch {}

  try {
    const res = await axios.get('https://ifconfig.me/ip', { timeout: 3500 });
    if (res.data && typeof res.data === 'string' && res.data.trim()) {
      return res.data.trim();
    }
  } catch {}

  try {
    const res = await axios.get('https://1.1.1.1/cdn-cgi/trace', { timeout: 3500 });
    if (res.data && typeof res.data === 'string') {
      const match = res.data.match(/ip=([^\r\n]+)/);
      if (match && match[1]) return match[1].trim();
    }
  } catch {}

  return '127.0.0.1';
}

async function startTelegramBot(config, stateManager, runtime, resolvedHost) {
  const token = String(TELEGRAM_BOT_TOKEN || '').trim();
  const admins = new Set((Array.isArray(TELEGRAM_ADMIN_IDS) ? TELEGRAM_ADMIN_IDS : [TELEGRAM_ADMIN_IDS]).map(x => String(x).trim()).filter(x => x && /^\d+$/.test(x))); 
  if (!token || token === 'توکن_ربات_اینجا') {
    Logger.warn('Telegram bot is disabled: edit TELEGRAM_BOT_TOKEN near the top of index-telegram-bot.js.');
    return null;
  }
  if (!admins.size) {
    Logger.warn('Telegram bot is disabled: edit TELEGRAM_ADMIN_IDS near the top of index-telegram-bot.js.');
    return null;
  }
  if (!config.enable.vlessWs || !runtime.singboxInstance) {
    Logger.warn('Telegram bot is disabled: VLESS WS / sing-box is unavailable.');
    return null;
  }

  const api = `https://api.telegram.org/bot${token}`;
  let offset = 0;
  let stopped = false;
  const send = async (chatId, message) => {
    await axios.post(`${api}/sendMessage`, { chat_id: chatId, text: String(message).slice(0, 4090), disable_web_page_preview: true }, { timeout: 20000 });
  };
  const bytes = (n) => {
    n = Number(n || 0);
    if (n < 1024) return `${n.toFixed(0)} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(2)} KB`;
    if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`;
    return `${(n / 1024 ** 3).toFixed(3)} GB`;
  };
  const getUsers = () => {
    const state = stateManager.state;
    const ids = Array.isArray(state.vlessUuids) ? state.vlessUuids : [];
    const names = Array.isArray(state.vlessUserNames) ? state.vlessUserNames : [];
    const snap = BkTraffic.snapshot();
    const users = [];
    for (let i = 0; i < ids.length; i++) {
      if (!ids[i]) continue;
      const key = `VLESS-WS-${i + 1}`;
      const month = (snap.month && snap.month.per && snap.month.per[key]) || { up: 0, down: 0 };
      const all = (snap.allTime && snap.allTime.per && snap.allTime.per[key]) || { up: 0, down: 0 };
      users.push({ index: i, number: i + 1, uuid: ids[i], name: names[i] || `User ${i + 1}`, month: (month.up || 0) + (month.down || 0), all: (all.up || 0) + (all.down || 0) });
    }
    return users;
  };
  const makeLink = (uuid) => {
    const nodes = new LinkGenerator(config, stateManager.state, resolvedHost).getAllNodes({ compat: 'full', allowLocalHostLinks: true });
    const found = nodes.find(n => n.uri && n.uri.includes(uuid));
    if (!found) throw new Error('ساخت لینک VLESS ناموفق بود');
    return found.uri;
  };
  const addUser = async (name) => {
    const state = stateManager.state;
    const ids = Array.isArray(state.vlessUuids) ? state.vlessUuids : (state.vlessUuids = []);
    state.vlessUserNames = Array.isArray(state.vlessUserNames) ? state.vlessUserNames : [];
    const cleanName = String(name || '').trim().replace(/[\\/?#%<>]/g, '').replace(/\s+/g, ' ').slice(0, 32);
    if (!cleanName) throw new Error('اسم کاربر رو هم بعد از دستور بنویس\nمثال: جدید علی');
    if (getUsers().some(u => u.name.toLowerCase() === cleanName.toLowerCase())) throw new Error('این نام قبلاً ثبت شده\nیه اسم دیگه انتخاب کن');
    let index = -1;
    for (let i = 0; i < ids.length; i++) if (!ids[i]) { index = i; break; }
    if (index < 0) index = ids.length;
    if (index >= 64) throw new Error('ظرفیت ساخت ۶۴ کاربر تکمیل شده است');
    const uuid = crypto.randomUUID();
    const portIndex = index;
    const ports = runtime.allocatedPorts.vlessWsUsers || (runtime.allocatedPorts.vlessWsUsers = []);
    const oldId = ids[index], oldName = state.vlessUserNames[index], oldPort = ports[portIndex];
    try {
      if (index < ids.length) ids[index] = uuid; else ids.push(uuid);
      state.vlessUserNames[index] = cleanName;
      ports[portIndex] = await allocatePorts();
      stateManager.save();
      BkTraffic.register(`VLESS-WS-${index + 1}`);
      const ok = await runtime.singboxInstance.restart();
      if (!ok) throw new Error('sing-box نتونست با کاربر جدید راه‌اندازی بشه');
      return { name: cleanName, number: index + 1, uuid, uri: makeLink(uuid) };
    } catch (err) {
      if (index < ids.length) ids[index] = oldId || null;
      if (oldName === undefined) delete state.vlessUserNames[index]; else state.vlessUserNames[index] = oldName;
      if (oldPort === undefined) delete ports[portIndex]; else ports[portIndex] = oldPort;
      BkTraffic.remove(`VLESS-WS-${index + 1}`);
      stateManager.save();
      try { await runtime.singboxInstance.restart(); } catch (_) {}
      throw err;
    }
  };
  const deleteUser = async (name) => {
    const users = getUsers();
    const needle = String(name || '').trim().replace(/^@/, '').toLowerCase();
    const user = users.find(u => u.name.toLowerCase() === needle || u.uuid.toLowerCase() === needle);
    if (!user) throw new Error('کاربری با این نام پیدا نشد\nاسم رو از لیست کاربران بررسی کن');
    const state = stateManager.state;
    const ids = state.vlessUuids;
    const ports = runtime.allocatedPorts.vlessWsUsers || [];
    const portIndex = user.index;
    const oldPort = ports[portIndex];
    ids[user.index] = null;
    state.vlessUserNames[user.index] = '';
    ports[portIndex] = null;
    BkTraffic.remove(`VLESS-WS-${user.number}`);
    stateManager.save();
    try {
      const ok = await runtime.singboxInstance.restart();
      if (!ok) throw new Error('sing-box بعد از حذف کاربر راه‌اندازی نشد');
      return user;
    } catch (err) {
      ids[user.index] = user.uuid;
      state.vlessUserNames[user.index] = user.name;
      ports[portIndex] = oldPort;
      BkTraffic.register(`VLESS-WS-${user.number}`);
      stateManager.save();
      try { await runtime.singboxInstance.restart(); } catch (_) {}
      throw err;
    }
  };
  const listUsers = async (chatId) => {
    const users = getUsers();
    if (!users.length) return send(chatId, '📭 هنوز کاربری ساخته نشده\n\nبرای ساخت اولین کانفیگ فقط بنویس\n➕ جدید اسم کاربر');
    const totalMonth = users.reduce((sum, u) => sum + u.month, 0);
    const totalAll = users.reduce((sum, u) => sum + u.all, 0);
    const chunks = [];
    let part = `👥 مدیریت کاربران\n━━━━━━━━━━━━━━\n👤 تعداد کاربران: ${users.length}\n📅 مصرف این ماه: ${bytes(totalMonth)}\n📊 مجموع مصرف: ${bytes(totalAll)}\n━━━━━━━━━━━━━━\n\n`;
    for (const u of users) {
      const line = `🟢 ${u.number}. ${u.name}\n   📅 این ماه: ${bytes(u.month)}\n   📊 مصرف کل: ${bytes(u.all)}\n━━━━━━━━━━━━━━\n`;
      if (part.length + line.length > 3800) { chunks.push(part); part = '👥 ادامه فهرست کاربران\n\n'; }
      part += line + '\n';
    }
    chunks.push(part);
    for (const chunk of chunks) await send(chatId, chunk);
  };

  const handle = async (msg) => {
    if (!msg || !msg.chat || !msg.from) return;
    const chatId = msg.chat.id;
    const senderId = String(msg.from.id);
    if (!admins.has(senderId)) return;
    const input = String(msg.text || '').trim();
    if (!input) return;
    if (input === '/start' || input === '/help' || input === 'راهنما') {
      return send(chatId, '👋 سلام مدیر عزیز\nبه پنل مدیریت Blue Knight خوش اومدی\n━━━━━━━━━━━━━━\n➕ ساخت کاربر\nجدید اسم کاربر\n\n👥 مشاهده کاربران و مصرف\nلیست کاربران\n\n🔗 دریافت مجدد کانفیگ کاربر\nکانفیگ + اسم کاربر\n\n🗑 حذف کاربر\nدلت اسم کاربر\n━━━━━━━━━━━━━━\n✨ همه‌چیز آماده مدیریت کانفیگ‌هاست');
    }
    if (/^جدید(?:\s|$)/u.test(input)) {
      try {
        const user = await addUser(input.replace(/^جدید\s*/u, ''));
        await send(chatId, `🎉 کاربر با موفقیت ساخته شد\n━━━━━━━━━━━━━━\n👤 نام: ${user.name}\n🔢 شماره: ${user.number}\n🔐 پروتکل: VLESS WebSocket\n━━━━━━━━━━━━━━\n🔗 لینک اختصاصی کاربر\n${user.uri}\n━━━━━━━━━━━━━━\n💡 لینک رو کپی کن و برای کاربر بفرست`);
      } catch (e) { await send(chatId, `❌ ${e.message}`); }
      return;
    }
    if (input === 'لیست کاربران' || input === 'لیست') return listUsers(chatId);
    if (/^کانفیگ(?:\s*\+?\s*)/u.test(input)) {
      const userName = input.replace(/^کانفیگ(?:\s*\+?\s*)/u, '').trim();
      if (!userName) {
        await send(chatId, '✍️ اسم کاربر رو بعد از دستور بنویس\nمثال: کانفیگ + علی');
        return;
      }
      const needle = userName.toLocaleLowerCase('fa');
      const user = getUsers().find(u => u.name.toLocaleLowerCase('fa') === needle);
      if (!user) {
        await send(chatId, '🔎 کاربری با این نام پیدا نشد\nاسم رو دقیقاً مثل لیست کاربران وارد کن');
        return;
      }
      try {
        const uri = makeLink(user.uuid);
        await send(chatId, `🔐 کانفیگ اختصاصی کاربر\n━━━━━━━━━━━━━━\n👤 نام: ${user.name}\n🔢 شماره: ${user.number}\n🌐 پروتکل: VLESS WebSocket\n━━━━━━━━━━━━━━\n${uri}\n━━━━━━━━━━━━━━\n📌 لینک بالا رو کپی کن و در برنامه موردنظرت وارد کن`);
      } catch (e) {
        await send(chatId, `❌ دریافت کانفیگ ناموفق بود\n${e.message}`);
      }
      return;
    }
    if (/^دلت(?:\s|$)/u.test(input)) {
      try {
        const user = await deleteUser(input.replace(/^دلت\s*/u, ''));
        await send(chatId, `🗑 کاربر با موفقیت حذف شد\n━━━━━━━━━━━━━━\n👤 ${user.name}\n🔒 دسترسی این کاربر غیرفعال شد`);
      } catch (e) { await send(chatId, `❌ ${e.message}`); }
      return;
    }
    await send(chatId, '🤔 این دستور رو نشناختم\n\nبرای راهنمایی /start رو بفرست');
  };

  Logger.success('Telegram management bot started (long polling).');
  (async () => {
    while (!stopped) {
      try {
        const response = await axios.post(`${api}/getUpdates`, { offset, timeout: 30, allowed_updates: ['message'] }, { timeout: 40000 });
        if (!response.data || !response.data.ok) throw new Error('Telegram getUpdates failed');
        for (const update of response.data.result || []) {
          offset = Math.max(offset, update.update_id + 1);
          try { await handle(update.message); }
          catch (e) { Logger.warn('Telegram update error: ' + e.message); }
        }
      } catch (e) {
        if (!stopped) {
          Logger.warn('Telegram polling error: ' + e.message);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
  })();
  return { stop: () => { stopped = true; } };
}

async function startGate(userConfig = {}) {
  // 1. Banner & notices
  Logger.banner();
  Logger.renewNotice();

  // 2. Build configuration
  const config = buildConfig(userConfig);
  // This build is Telegram-managed VLESS WebSocket only. Do not provision
  // default users or expose any other protocol/inbound.
  for (const protocol of Object.keys(config.enable || {})) config.enable[protocol] = false;
  config.enable.vlessWs = true;
  Logger.section('Configuration');
  Logger.item('Public Port', config.publicPort);
  Logger.item('Panel Path', `/${config.panelPath}`);
  Logger.item('Data Directory', config.paths.dataDir);
  {
    const dInfo = resolveDataDir.info || { source: 'unknown' };
    const onRw = !!(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PUBLIC_DOMAIN);
    const vol = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    Logger.info(`Data directory: ${config.paths.dataDir} (${dInfo.source})`);
    if (bkOnReplit() && !process.env.BK_DATA_DIR) {
      Logger.warn('Replit: the published app filesystem resets on every Publish (and on Autoscale restarts).');
      Logger.warn('To keep the same configs/password, add Secrets UUID, PANEL_PASSWORD and SUB_TOKEN (all optional).');
    } else if (onRw && !vol) {
      Logger.warn('No Railway Volume attached: panel password, UUID and configs are reset on every redeploy.');
      Logger.warn('Fix (no variables needed): right-click the service -> Attach Volume (any mount path, e.g. /data).');
    } else if (onRw && vol && path.resolve(config.paths.dataDir) !== path.resolve(vol) && !path.resolve(config.paths.dataDir).startsWith(path.resolve(vol) + path.sep)) {
      Logger.warn(`Data directory is outside the attached volume (${vol}); remove BK_DATA_DIR or point it inside the volume to keep data.`);
    }
  }

  BkTraffic.init(config.paths.dataDir);

  // 3. Persistent state
  const stateMgr = new StateManager(config.paths, config);
  const state = stateMgr.loadOrCreate();
  Logger.item('VLESS UUIDs', `${(state.vlessUuids || [state.uuid]).length} independent credentials (persisted)`);

  // 4. Resolve host / IP
  const resolvedHost = await resolvePublicHost(config, state.publicHost || '');
  stateMgr.setPublicIp(resolvedHost);
  Logger.item('Resolved Host', resolvedHost);

  // 5. Allocate dynamic internal ports
  const allocatedPorts = {};
  if (config.enable.vlessWs) allocatedPorts.vlessWsUsers = await Promise.all(Array.from({ length: (state.vlessUuids || []).length }, () => allocatePorts()));
  if (config.enable.vlessWsTls) allocatedPorts.vlessWsTls = await allocatePorts();
  if (config.enable.vmessWs || config.enable.vmessWsTls) allocatedPorts.vmessWs = await allocatePorts();
  if (config.enable.trojanGrpcTls) allocatedPorts.trojanGrpcTls = await allocatePorts();
  if (config.enable.vlessHttpUpgrade) allocatedPorts.vlessHuUsers = await Promise.all(Array.from({ length: 4 }, () => allocatePorts()));
  if (config.enable.vlessGrpc || config.enable.vlessGrpcTls) allocatedPorts.vlessGrpc = await allocatePorts();
  if (config.enable.vlessGrpcTls) allocatedPorts.vlessGrpcTls = await allocatePorts();
  if (config.enable.vmessHttpUpgrade) allocatedPorts.vmessHu = await allocatePorts();
  if (config.enable.trojanHttpUpgrade) allocatedPorts.trojanHu = await allocatePorts();
  if (config.enable.ssWs) allocatedPorts.ssWs = await allocatePorts();
  if (config.enable.trojanWs) allocatedPorts.trojanWs = await allocatePorts();
  if (config.enable.reality) allocatedPorts.reality = await allocatePorts();
  if (config.enable.shadowTlsVless) allocatedPorts.shadowTls = await allocatePorts();
  if (config.enable.shadowsocks) allocatedPorts.shadowsocks = await allocatePorts();
  if (config.enable.socks) allocatedPorts.socks = await allocatePorts();
  if (config.enable.httpProxy) allocatedPorts.httpProxy = await allocatePorts();
  if (config.enable.vlessXhttp) allocatedPorts.xray = await allocatePorts();

  // 6. Manage Binaries
  Logger.section('Engines & Binaries');
  const binManager = new BinaryManager(config);

  const hasSingBox = await binManager.ensureSingBox();
  let hasXray = false;
  if (config.enable.vlessXhttp || config.enable.ssWs) {
    hasXray = await binManager.ensureXray();
  }
  let hasCloudflared = false;
  if (config.enable.argo) {
    hasCloudflared = await binManager.ensureCloudflared();
  }

  // 7. Start Engine Instances
  let singboxInstance = null;
  if (hasSingBox) {
    singboxInstance = new SingBoxEngine(config, stateMgr, allocatedPorts);
    singboxInstance.start();
  } else {
    Logger.warn('sing-box binary could not be started. (Mock/offline mode active).');
  }

  let xrayInstance = null;
  config.xhttpPort = null;
  config.ssWsPort = null;
  if (hasXray && (allocatedPorts.xray || allocatedPorts.ssWs)) {
    xrayInstance = new XrayEngine(config, stateMgr, { xhttp: allocatedPorts.xray, ssWs: allocatedPorts.ssWs });
    if (xrayInstance.start()) {
      config.xhttpPort = allocatedPorts.xray || null;
      config.ssWsPort = allocatedPorts.ssWs || null;
    } else {
      Logger.warn('Xray-core did not start; VLESS-XHTTP / Shadowsocks-WS links hidden.');
    }
  } else if (config.enable.vlessXhttp || config.enable.ssWs) {
    Logger.warn('VLESS-XHTTP / Shadowsocks-WS enabled but Xray-core is not available; their links are hidden.');
  }

  let argoInstance = null;
  let argoDomain = null;
  if (hasCloudflared && config.enable.argo) {
    argoInstance = new ArgoTunnel(config, config.publicPort);
    argoDomain = await argoInstance.start();
  }

  // 8. Generate share links & subscriptions
  const linkGen = new LinkGenerator(config, stateMgr.state, resolvedHost);
  const compatNodes = linkGen.getAllNodes({ compat: 'v2ray', argoDomain, allowLocalHostLinks: config.allowLocalHostLinks });
  const allNodes = linkGen.getAllNodes({ compat: 'full', argoDomain, allowLocalHostLinks: true });
  const links = compatNodes.map(n => n.uri);
  const clashYaml = linkGen.buildClashMetaYaml(allNodes);
  const singboxJson = linkGen.buildSingBoxClientJson(allNodes);

  stateMgr.setLinks(links, clashYaml, singboxJson);

  // 9. Protocol multiplexer only. The website and management panel are removed.
  const runtime = { singboxInstance, allocatedPorts, tcpRouter: null };
  const { server: expressServer, app: expressApp } = createHttpPanel(config, stateMgr, () => ({}), () => resolvedHost, runtime);
  const tcpRouter = new TcpRouter(config, allocatedPorts, expressServer, expressApp);
  runtime.tcpRouter = tcpRouter;
  await tcpRouter.start();

  // 10. Telegram management bot
  const telegramBot = await startTelegramBot(config, stateMgr, runtime, resolvedHost);
  Logger.item('Link host / SNI', `${linkGen.host} / ${linkGen.tlsOpt.sni} (port ${linkGen.port}, fp=${linkGen.tlsOpt.fp || 'none'}, alpn=${linkGen.tlsOpt.alpn.join(',') || 'none'})`);
  Logger.section('Blue Knight VLESS Bot Active');
  Logger.item('Host', bkPlatformName());
  Logger.item('Website / Panel', 'Removed');
  Logger.item('Telegram Bot', telegramBot ? 'Running' : 'Disabled (check bot token and admin IDs)');

  // Graceful shutdown
  const shutdown = () => {
    Logger.info('Stopping Blue Knight Gate...');
    if (singboxInstance) singboxInstance.stop();
    if (xrayInstance) xrayInstance.stop();
    if (argoInstance) argoInstance.stop();
    if (tcpRouter) tcpRouter.stop();
    if (telegramBot) telegramBot.stop();
    try { BkTraffic.save(); } catch (_) {}
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return {
    config,
    state: stateMgr.state,
    nodes: compatNodes,
    allNodes,
    allocatedPorts,
    telegramBot,
    tcpRouter,
    singboxInstance,
    xrayInstance,
    argoInstance,
    shutdown
  };
}

// --- Auto-start execution ---
if (require.main === module) {
  startGate(BK_CONFIG).catch(err => {
    console.error('[FATAL] Failed to start Blue Knight Gate:', err);
    process.exit(1);
  });
}

module.exports = {
  BK_CONFIG,
  startGate
};
