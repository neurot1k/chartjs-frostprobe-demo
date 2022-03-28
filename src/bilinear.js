/**
 * Bilinear interpolation for the frost probe graph data points.
 *
 * @param {real[][]} src 2D array of measured temperatures from the frost probe sensor
 * @param {int[]} dX Number of values to interpolate between each data point in src for the x-axis (time)
 * @param {int[]} dY Number of values to interpolate between each data point in src for the y-axis (depth)
 * @returns {real[][]} A 2D array of temperatures (measured values from src + a variable number of interplotated values)
 */
 export default function bilinear(src, dX, dY) {
  const data = [];

  if (src.length > 0) {
    // Y
    for (let y = 0; y < dY.length; y++) {
      data.push(src[y]);
      for (let j = 1; j <= dY[y]; j++) {
        const row = [];
        for (let x = 0; x < src[y].length; x++) {
          if (src[y][x] === null || src[y+1][x] === null) {
            row.push(null);
          }
          else {
            row.push(src[y][x] + (src[y+1][x] - src[y][x]) / (dY[y] + 1) * j);
          }
        }
        data.push(row);
      }
    }
    data.push(src[src.length-1]);

    // X
    for (let y = 0; y < data.length; y++) {
      const row = [];
      for (let x = 0; x < dX.length; x++) {
        row.push(data[y][x]);
        if (data[y][x] === null || data[y][x+1] === null) {
          for (let i = 1; i <= dX[x]; i++) {
            row.push(null);
          }
        }
        else {
          for (let i = 1; i <= dX[x]; i++) {
            row.push(data[y][x] + (data[y][x+1] - data[y][x]) / (dX[x] + 1) * i);
          }
        }
      }
      row.push(data[y][data[y].length-1]);
      data[y] = row;
    }
  }

  return data;
}