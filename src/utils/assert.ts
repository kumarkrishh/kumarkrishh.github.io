export default function(cond: boolean, msg?: string): asserts cond {
  if (!cond) {
    throw new Error(msg);
  }
}
