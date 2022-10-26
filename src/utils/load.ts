// this function may throw
export async function fetchText(url:string): Promise<string> {
  let data = await fetch(url);
  return await data.text()
}

