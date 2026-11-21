import "./github.mjs";
import {readFileSync} from "node:fs";
import {createServer} from "node:https";
import {randomBytes} from "node:crypto";
import {setTimeout as delay} from "node:timers/promises";
import {MongoClient} from "mongodb";
import next from "next";

const port = 3197, host = "127.0.0.1", member = host + ":37917";
Object.assign(process.env, {
  VERCEL:"1", VERCEL_ENV:"preview", GITHUB_TOKEN:"fixture_only", SIGNING_SECRET:randomBytes(32).toString("hex"),
  MONGODB_URI:"mongodb://" + member + "/?directConnection=true", MONGODB_DB:"repovitrin_e2e",
  SITE_URL:"https://" + host + ":" + port, NEXT_TELEMETRY_DISABLED:"1",
});
const client = new MongoClient(process.env.MONGODB_URI);
try {
  const admin = client.db("admin");
  await admin.command({replSetInitiate:{_id:"rv-e2e",members:[{_id:0,host:member}]}});
  const deadline = Date.now() + 30_000;
  while (!(await admin.command({hello:1})).isWritablePrimary) {
    if (Date.now() >= deadline) throw Error("Test replica set not ready");
    await delay(100);
  }
} finally {await client.close();}
const app = next({dev:false,hostname:host,port});
await app.prepare();
const handler = app.getRequestHandler();
const work = process.argv[2];
createServer({key:readFileSync(work+"/key"),cert:readFileSync(work+"/cert")},(req,res)=>{
  req.headers["x-vercel-forwarded-for"]="192.0.2.9";
  return handler(req,res);
}).listen(port,host);
