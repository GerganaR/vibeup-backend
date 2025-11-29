export const logger = {
  error: (data: any) => console.error(JSON.stringify(data, null, 2)),
  warn: (data: any) => console.warn(JSON.stringify(data, null, 2)),
  info: (data: any) => console.log(JSON.stringify(data, null, 2)),
};
