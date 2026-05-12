type HeaderValue = string | string[] | undefined;

type RequestLike = {
  protocol?: string;
  headers?: Record<string, HeaderValue>;
  socket?: {
    encrypted?: boolean;
  };
};

export type SessionCookieOptions = {
  domain?: string;
  httpOnly: true;
  path: "/";
  sameSite: "none";
  secure: boolean;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function getHeader(req: RequestLike, key: string): HeaderValue {
  const headers = req.headers;
  if (!headers) return undefined;

  const exact = headers[key];
  if (exact !== undefined) return exact;

  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

function isSecureRequest(req: RequestLike) {
  if (req.protocol === "https") return true;

  if (req.socket?.encrypted) return true;

  const forwardedProto = getHeader(req, "x-forwarded-proto");
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: RequestLike
): SessionCookieOptions {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
