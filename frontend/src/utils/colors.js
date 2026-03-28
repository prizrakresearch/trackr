const PALETTE = [
  { bg: "#1a3a5c", text: "#7bb8f0" },
  { bg: "#0c2519", text: "#4caf87" },
  { bg: "#2e200a", text: "#d4943a" },
  { bg: "#3a1515", text: "#e07070" },
  { bg: "#251a4a", text: "#a98ff0" },
  { bg: "#3a2510", text: "#f0b87b" },
  { bg: "#0c2a28", text: "#7be0d4" },
  { bg: "#3a1025", text: "#f07ba8" },
]

export function colorFromName(name = "") {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length
  }
  return PALETTE[Math.abs(hash)]
}