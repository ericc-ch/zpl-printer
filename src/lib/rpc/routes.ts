import { createEndpoint, createRouter } from "better-call";
import { z } from "zod";
import { printZPLContent, printZPLFile } from "../zpl/print";
import { listPrinters, findPrinterByName, getDefaultPrinter } from "../zpl/printers";
import { getPrinterStatus } from "../zpl/status";
import { PrintOptionsSchema } from "../zpl/utils";

const printZPL = createEndpoint(
  "/api/print",
  {
    method: "POST",
    body: z.object({
      content: z.string(),
      options: PrintOptionsSchema,
    }),
  },
  async (ctx) => {
    const result = await printZPLContent(ctx.body.content, ctx.body.options);
    return result;
  },
);

const printZPLFileEndpoint = createEndpoint(
  "/api/print/file",
  {
    method: "POST",
    body: z.object({
      filePath: z.string(),
      options: PrintOptionsSchema,
    }),
  },
  async (ctx) => {
    const result = await printZPLFile(ctx.body.filePath, ctx.body.options);
    return result;
  },
);

const getPrinters = createEndpoint(
  "/api/printers",
  {
    method: "GET",
  },
  async () => {
    const printers = listPrinters();
    return { printers };
  },
);

const findPrinter = createEndpoint(
  "/api/printers/:name",
  {
    method: "GET",
  },
  async (ctx) => {
    const printer = findPrinterByName(ctx.params.name);
    if (!printer) {
      throw ctx.error(404, { message: "Printer not found" });
    }
    return { printer };
  },
);

const getDefault = createEndpoint(
  "/api/printers/default",
  {
    method: "GET",
  },
  async (ctx) => {
    const printer = getDefaultPrinter();
    if (!printer) {
      throw ctx.error(404, { message: "No default printer found" });
    }
    return { printer };
  },
);

const getStatus = createEndpoint(
  "/api/printers/:name/status",
  {
    method: "GET",
  },
  async (ctx) => {
    const status = getPrinterStatus(ctx.params.name);
    if (!status) {
      throw ctx.error(404, { message: "Printer not found or status unavailable" });
    }
    return { status };
  },
);

export const router = createRouter({
  printZPL,
  printZPLFileEndpoint,
  getPrinters,
  findPrinter,
  getDefault,
  getStatus,
});
