let arr = [
  -0.8, -0.5,     // ????? 1 
  1.0, 0.0, 0.0,
  0.0, 0.8,      // ????? 2 
  0.0, 1.0, 0.0,
  0.8, -0.5,     // ????? 3
  0.0, 0.0, 1.0
]

arr = arr.map(e => e * 0.2 / 6)

export default arr