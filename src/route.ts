import { createRoute, z } from "@hono/zod-openapi"

const mediaDownloadRoute = createRoute({
  method: "get",
  path: "/file",
  request: {
    query: z.object({
      id: z.string().openapi({ description: "Media ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "image/*": {
          schema: {
            format: "binary",
            type: "string",
          },
        },
      },
      description: "Media downloaded successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: z
            .object({
              message: z.string(),
            })
            .openapi("Media not found"),
        },
      },
      description: "Media not found",
    },
  },
})

const mediaUploadRoute = createRoute({
  method: "post",
  path: "/file",
  request: {
    body: {
      content: {
        "image/*": {
          schema: {
            format: "binary",
            type: "string",
          },
        },
      },
      required: true,
    },
    headers: z.object({
      "x-media-id": z.string().openapi({ description: "Media ID" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z
            .object({
              message: z.string(),
            })
            .openapi("Media uploaded successfully"),
        },
      },
      description: "Media uploaded successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: z
            .object({
              message: z.string(),
            })
            .openapi("Failed to upload media"),
        },
      },
      description: "Failed to upload media",
    },
  },
})

export { mediaDownloadRoute, mediaUploadRoute }
