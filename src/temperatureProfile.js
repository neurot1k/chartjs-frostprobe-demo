import { DatasetController, Element } from 'chart.js';
import bilinear from './bilinear';


// This Element does nothing as we will draw to the canvas directly in the
// controller. The docs say I can set datasetElementType and dataElementType
// to null in the controller defaults, but that didn't work for me. (possible
// chartjs bug? Doing it this way creates an array of elements that have no
// meaning real meaning so it's not ideal if you're passing that dataset off to
// another part of the application, but it works to demo the frost probe graph.
export class TemperatureProfileElement extends Element {
  static id = 'temperatureProfile';

  inRange() {
    return false;
  }
}

// This is where all the action happens to display the Frost Probe graph.
export class TemperatureProfileController extends DatasetController {
  static id = 'temperatureProfile';
  static defaults = {
    datasetElementType: TemperatureProfileElement.id,
    dataElementType: TemperatureProfileElement.id,
    minRange: -1,
    maxRange: 1,
  };

  invalidStyle(options) {
    const defaultOptions = {
      size: 8,
      lineWidth: 2,
      color: '#ffffff',
    }
    const { size, lineWidth, color } = Object.assign({}, defaultOptions, options)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = size / 2 * (i - 1);
      ctx.moveTo(a, size - 1 + a);
      ctx.lineTo(size - 1 + a, a);
    }
    ctx.stroke();

    return ctx.createPattern(canvas, 'repeat');
  }


  draw() {
    const { ctx, chartArea, data } = this.chart;
    const { minRange, maxRange } = this.options;
    const dataset = data.datasets.find(dataset => dataset.type === TemperatureProfileController.id);
    const pixelRatio = window.devicePixelRatio || 1;
    const xScale = this.chart.scales[dataset.xAxisID || 'x'];
    const yScale = this.chart.scales[dataset.yAxisID || 'y'];
    const width = Math.round((chartArea.right - chartArea.left) * pixelRatio);
    const height = Math.round(chartArea.height * pixelRatio);
    const left = Math.round(chartArea.left * pixelRatio);
    const top = Math.round(chartArea.top * pixelRatio);
    const imageData = ctx.getImageData(left, top, width, height);
    const buffer = new Uint8Array(imageData.data.buffer);
    const points = [];
    const dX = [];
    const dY = [];
    const ys = [];
    const invalid = [];
    let plotData = null;
    let prevX = null;
    let prevY = null;
    let startX = 0;
    let offsetX = 0;


    // Transform data for use in the image buffer.
    // points is a temperature matrix with dimensions n x m, where n is the number of thermistors and m is the number
    // of observations. dY (1 x n-1 matrix) and dX (1 x m-1 matrix) represent the number of pixels that need to be
    // interpolated between neighbouring thermisor points on the chart.
    for (let i = 0; i < dataset.data.length; i++) {
      const x = Math.round(xScale.getPixelForValue(dataset.data[i][0]) * pixelRatio - left);

      if (prevX === null) {
        if (i === 0) {
          startX = x;
        }

        for (let j = 0; j < dataset.data[i][1].length; j++) {
          const y = Math.round(yScale.getPixelForValue(yScale.options.thermistorDepths[j]) * pixelRatio - top);

          if (prevY !== null) {
            dY.push(Math.max(0, y - prevY - 1));
          }

          points.push([]);
          ys.push(y);
          prevY = y;
        }

        // If start datapoint does not align with left side plot area we'll need the previous datapoint as well
        if (x > 0 && i > 0) {
          offsetX = Math.round(xScale.getPixelForValue(dataset.data[i-1][0])) * scale;
          dX.push(Math.max(0, x - offsetX - 1));
          for (let j = 0; j < dataset.data[i-1][1].length; j++) {
            if (!yScale.options.showInvalidData && dataset.data[i-1][2].cl[j] < 0) points[j].push(null);
            else points[j].push(dataset.data[i-1][1][j]);
          }
        }

      }
      else {
        dX.push(Math.max(0, x - prevX - 1));
      }

      for (let j = 0; j < dataset.data[i][1].length; j++) {
        if (dataset.data[i][2].cl[j] < 0) {
          if (yScale.options.showInvalidData) {
            invalid.push({ x, y: ys[j], i: dX.length - 1, j });
            points[j].push(dataset.data[i][1][j]);
          }
          else points[j].push(null);
        }
        else points[j].push(dataset.data[i][1][j]);
      }

      if (dataset.data[i][0] > xScale.max) {
        break;
      }

      prevX = x;
    }

    // Fill in the space between thermistor measurements using bilinear interpolation.
    plotData = bilinear(points, dX, dY);

    // Write pixels to image buffer
    for (let y = 0; y < plotData.length; y++) {
      let i = (y * width + startX) * 4;
      for (let x = -offsetX; x < Math.min(width - offsetX - startX, plotData[y].length - 1); x++) {
        if (plotData[y][x] !== null) {
          // Scale and clamp plotData values so that [minRange, maxRange] => [0, 1], then map to color gradient
          let v = Math.min(1, Math.max(0, (plotData[y][x] - minRange) / (maxRange - minRange)));
          buffer[i++] /* r */ = 575.23*v*v*v - 357.03*v*v - 34.577*v + 70.85;
          buffer[i++] /* g */ = -126.32*v*v + 360.17*v;
          buffer[i++] /* b */ = -339.05*v*v + 277.41*v + 86;
          buffer[i++] /* a */ = 0xff;
        }
        else {
          i += 4;
          continue;
        }
      }
    }

    // Draw dataset to canvas
    ctx.putImageData(imageData, left, top);

    // Add overlay to any regions with confidence level < 0 to visually mark them as invalid.
    if (yScale.options.showInvalidData) {
      const invalidOverlayCanvas = document.createElement('canvas');
      invalidOverlayCanvas.height = height;
      invalidOverlayCanvas.width = width;
      const invalidOverlayContext = invalidOverlayCanvas.getContext('2d');
      invalidOverlayContext.fillStyle = this.invalidStyle();

      for (let k = 0; k < invalid.length; k++) {
        const { x, y, i, j } = invalid[k];
        let w = (i > 0 ? dX[i-1] : dX[i]) + dX[i] + 1;
        let h = (j > 0 ? dY[j-1] : dY[j]) + dY[j];
        invalidOverlayContext.fillRect((x - dX[i]) / pixelRatio, (y - dY[j] + 1) / pixelRatio, w / pixelRatio, h / pixelRatio);
      }

      ctx.drawImage(invalidOverlayCanvas, left / pixelRatio, top / pixelRatio);
    }
  }

  // docs say to implement this...
  update(mode) {
  }
}
