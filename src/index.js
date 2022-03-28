import { h, Component } from 'preact';
import './style';
import { TemperatureProfileController, TemperatureProfileElement } from './temperatureProfile.js';
import rwisDatasets from './data.js';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables, TemperatureProfileController, TemperatureProfileElement);


class App extends Component {
  componentDidMount() {
    const ctx = document.getElementById("myChart").getContext("2d");
    const title = (text) => ({
      display: true,
      font: {
        size: 16,
        weight: 700,
        family: 'sans-serif',
      },
      text,
    });
    const myChart = new Chart(ctx, {
      data: {
        datasets: [{
          type: 'line',
          label: rwisDatasets['opt.surface_temp'].label,
          data: rwisDatasets['opt.surface_temp'].data,
          borderColor: '#ff3300',
          pointRadius: 0,
        }, {
          type: 'temperatureProfile',
          label: rwisDatasets['fp.frost_probe'].label,
          data: rwisDatasets['fp.frost_probe'].data,
          yAxisID: 'fp',
          order: Infinity,  // Must draw last or it will cover the other datasets
        }]
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' }
          },
          y: {
            title: title('Temperature [°C]'),
            min: -10,
            max: 15,
          },
          fp: {
            position: 'right',
            min: rwisDatasets['fp.frost_probe'].meta.thermistorDepths[21],
            max: rwisDatasets['fp.frost_probe'].meta.thermistorDepths[0],
            thermistorDepths: rwisDatasets['fp.frost_probe'].meta.thermistorDepths,
            showInvalidData: true,
            grid: { drawOnChartArea: false },
            title: title('Frost Probe [Depth, cm]'),
          }
        }
      }
    });
  }

  render() {
    return (
      <div id="container">
        <h2>42091 - Dragon Lake</h2>
        <h3>Chart.js demo:</h3>
        <i>(Added invalid data datapoints to the demo data)</i>
        <canvas id="myChart" />
        <h3>Current state:</h3>
        <img src="assets/rwis-optical-screenshot.png" />
      </div>
    );
  }
}

export default App;