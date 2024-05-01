import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"

import { mediaDownloadRoute, mediaUploadRoute } from "./route"

type HonoConfig = {
  Bindings: {
    [k in keyof Env]: Env[k]
  }
  Variables: Record<string, never>
}

const app = new OpenAPIHono<HonoConfig>()

const route = app
  .openapi(mediaUploadRoute, async (c) => {
    const mediaId = c.req.valid("header")["x-media-id"]
    const media = await c.req.blob()

    const res = await c.env.MY_BUCKET.put(mediaId, media, {
      httpMetadata: c.req.raw.headers,
    })
    if (res == null) {
      return c.json({ message: "Failed to upload media" }, 500)
    }
    return c.json({ message: "Media uploaded successfully" })
  })
  .openapi(mediaDownloadRoute, async (c) => {
    const { id } = c.req.valid("query")
    const media = await c.env.MY_BUCKET.get(id)
    if (media == null) {
      return c.json({ message: "Media not found" }, 404)
    }

    const headers = new Headers()
    media.writeHttpMetadata(headers)
    headers.set("etag", media.etag)

    return new Response(media.body, {
      headers: headers,
    })
  })
  .doc("/doc", {
    info: {
      title: "My API",
      version: "1.0.0",
    },
    openapi: "3.0.0",
  })
  .get("/swagger", swaggerUI({ url: "/doc" }))

export type HonoRoute = typeof route
export default app
