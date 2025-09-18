type Fields = Record<string, unknown> | undefined;

function format(msg: string, fields?: Fields) {
  return fields ? `${msg} ${JSON.stringify(fields)}` : msg;
}

type ViteMeta = { env?: { DEV?: boolean } };
const meta = import.meta as unknown as ViteMeta;
const isDev = typeof import.meta !== "undefined" && Boolean(meta.env?.DEV);

export const logger = {
  debug(msg: string, fields?: Fields) {
    if (isDev) console.debug(format(msg, fields));
  },
  info(msg: string, fields?: Fields) {
    if (isDev) console.info(format(msg, fields));
  },
  warn(msg: string, fields?: Fields) {
// console.warn(format(msg, fields));
  },
  error(msg: string, err?: unknown, fields?: Fields) {
// console.error(format(msg, fields), err);
  },
};
