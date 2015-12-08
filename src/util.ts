export function spaceTrim(str:string):string{
  if (str) {
    return str.trim().replace(/\s+/g, ' ')
  } else {
    return ""
  }
}
