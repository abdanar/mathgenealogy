import { createServer, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { sqliteGenealogyRepository } from "../lib/data/sqlite-repository";

const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = new Set((process.env.MATHGENEALOGY_ALLOWED_ORIGINS ?? "http://localhost:3000,https://abdanar.github.io").split(",").map((origin) => origin.trim()).filter(Boolean));

function sendJson(response: ServerResponse, status: number, body: unknown, origin?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

function page(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (request.method === "OPTIONS") {
    if (!origin || !allowedOrigins.has(origin)) return sendJson(response, 403, { error: "Origin is not allowed." });
    response.writeHead(204, { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
    return response.end();
  }
  if (request.method !== "GET") return sendJson(response, 405, { error: "Method not allowed." }, origin);

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  try {
    if (url.pathname === "/health") return sendJson(response, 200, { status: "ok" }, origin);
    if (url.pathname === "/api/search/autocomplete") return sendJson(response, 200, await sqliteGenealogyRepository.searchMathematicians(url.searchParams.get("q") ?? ""), origin);
    if (url.pathname === "/api/search/results") return sendJson(response, 200, await sqliteGenealogyRepository.searchMathematiciansForResults(url.searchParams.get("q") ?? "", page(url.searchParams.get("page"))), origin);
    if (url.pathname === "/api/genealogy/path") {
      const source = url.searchParams.get("source");
      const target = url.searchParams.get("target");
      if (!source || !target) return sendJson(response, 400, { error: "source and target are required." }, origin);
      const path = await sqliteGenealogyRepository.findDescendantPath(source, target);
      return path ? sendJson(response, 200, path, origin) : sendJson(response, 404, { error: "No recorded descendant path found." }, origin);
    }
    const match = url.pathname.match(/^\/api\/mathematicians\/([^/]+)$/);
    if (match) {
      const genealogy = await sqliteGenealogyRepository.getLocalGenealogy(decodeURIComponent(match[1]));
      return genealogy ? sendJson(response, 200, genealogy, origin) : sendJson(response, 404, { error: "Mathematician not found." }, origin);
    }
    return sendJson(response, 404, { error: "Not found." }, origin);
  } catch {
    return sendJson(response, 500, { error: "Internal server error." }, origin);
  }
});

server.listen(port, () => console.log(`MathGenealogy API listening on port ${port}`));