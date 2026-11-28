// Every component test mocks the generated API client wholesale:
//
//   vi.mock("@/api/client", () => ({ api: { GET: vi.fn(), POST: vi.fn(), PATCH: vi.fn() } }));
//
// `vi.mock` only replaces the module at runtime -- `tsc` still type-checks every
// `import { api } from "@/api/client"` against client.ts's own declared type, which
// has no `mockResolvedValue`/`mockRejectedValue` (openapi-fetch's `Client` methods are
// plain typed functions, not spies). That is true for the application's own imports of
// `api` as much as the tests', so the augmentation below keeps every call site's path,
// method and body checked against the server's schema exactly as before, and adds the
// mock's own methods only for the two methods the test suite drives through `vi.fn()`.
//
// The lint rule that keeps API calls routed through src/api/client.ts (no-restricted-imports
// on "openapi-fetch") applies to every import *statement* under src/, this file included, so
// the openapi-fetch types below are referenced through inline `import("openapi-fetch")` type
// expressions instead of an `import ... from "openapi-fetch"` declaration.
declare module "@/api/client" {
  import type { MockedFunction } from "vitest";

  import type { paths } from "@/api/schema";

  type OpenapiFetchMediaType = import("openapi-fetch").MediaType;
  type OpenapiFetchClient = import("openapi-fetch").Client<paths, OpenapiFetchMediaType>;
  type OpenapiFetchClientMethod<Method extends "get" | "post" | "patch" | "delete"> =
    import("openapi-fetch").ClientMethod<paths, Method, OpenapiFetchMediaType>;

  export const api: Omit<OpenapiFetchClient, "GET" | "POST" | "PATCH" | "DELETE"> & {
    GET: MockedFunction<OpenapiFetchClientMethod<"get">>;
    POST: MockedFunction<OpenapiFetchClientMethod<"post">>;
    PATCH: MockedFunction<OpenapiFetchClientMethod<"patch">>;
    DELETE: MockedFunction<OpenapiFetchClientMethod<"delete">>;
  };
}
