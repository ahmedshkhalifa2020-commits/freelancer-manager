import logger from "./src/lib/logger";

export const runtime = "nodejs";

export async function register() {
  logger.info("Application starting up");
}

export async function onRequestError(
  err: Error,
  request: Request,
  context: any,
) {
  logger.error({
    message: "Request error",
    error: err.message,
    stack: err.stack,
    url: request.url,
    method: request.method,
  });
}
