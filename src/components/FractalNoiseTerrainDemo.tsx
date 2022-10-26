import React from "react";
import ScalarMap from "../utils/ScalarMap";
import ImageDataDisplay from "../components/ImageDataDisplay";
import { thresholdHeightMap } from "../utils/map";
import { makeNoise4D } from 'open-simplex-noise';


type FractalNoiseTerrainDemoProps = {
  style?: React.CSSProperties,
  className?: string,
  showMountainNoise: boolean,
  width: number,
  height: number
  defaultSeed: number,
  defaultHeightOffset: number,
  defaultNoise128: number,
  defaultNoise64: number,
  defaultNoise32: number,
  defaultNoise16: number,
  defaultNoise8: number,
  defaultNoise4: number,
  defaultNoise2: number,
};

type FractalNoiseTerrainDemoState = {
  img: ImageData;
};

class FractalNoiseTerrainDemo extends React.Component<FractalNoiseTerrainDemoProps, FractalNoiseTerrainDemoState> {

  private seedInput = React.createRef<HTMLInputElement>();
  private seedSet = React.createRef<HTMLButtonElement>();
  private heightOffsetRange = React.createRef<HTMLInputElement>();

  private noiseRange128 = React.createRef<HTMLInputElement>();
  private noiseRange64 = React.createRef<HTMLInputElement>();
  private noiseRange32 = React.createRef<HTMLInputElement>();
  private noiseRange16 = React.createRef<HTMLInputElement>();
  private noiseRange8 = React.createRef<HTMLInputElement>();
  private noiseRange4 = React.createRef<HTMLInputElement>();
  private noiseRange2 = React.createRef<HTMLInputElement>();

  private noiseField128!: ScalarMap;
  private noiseField64!: ScalarMap;
  private noiseField32!: ScalarMap;
  private noiseField16!: ScalarMap;
  private noiseField8!: ScalarMap;
  private noiseField4!: ScalarMap;
  private noiseField2!: ScalarMap;

  constructor(props: FractalNoiseTerrainDemoProps) {
    super(props);

    this.updateNoise(this.props.defaultSeed);

    this.state = {
      img: this.computeImage( //
        this.props.defaultHeightOffset, //
        this.props.defaultNoise128, //
        this.props.defaultNoise64, //
        this.props.defaultNoise32, //
        this.props.defaultNoise16, //
        this.props.defaultNoise8, //
        this.props.defaultNoise4, //
        this.props.defaultNoise2, //
      )
    };
  }



  componentDidMount() {
    this.paint();

    this.seedSet.current!.addEventListener('click', this.handleSeedChange);
    this.heightOffsetRange.current!.addEventListener('input', this.paint);
    this.noiseRange128.current!.addEventListener('input', this.paint);
    this.noiseRange64.current!.addEventListener('input', this.paint);
    this.noiseRange32.current!.addEventListener('input', this.paint);
    this.noiseRange16.current!.addEventListener('input', this.paint);
    this.noiseRange8.current!.addEventListener('input', this.paint);
    this.noiseRange4.current!.addEventListener('input', this.paint);
    this.noiseRange2.current!.addEventListener('input', this.paint);

  }

  componentWillUnmount() {
    this.seedSet.current!.removeEventListener('click', this.handleSeedChange);
    this.heightOffsetRange.current!.removeEventListener('input', this.paint);
    this.noiseRange128.current!.removeEventListener('input', this.paint);
    this.noiseRange64.current!.removeEventListener('input', this.paint);
    this.noiseRange32.current!.removeEventListener('input', this.paint);
    this.noiseRange16.current!.removeEventListener('input', this.paint);
    this.noiseRange8.current!.removeEventListener('input', this.paint);
    this.noiseRange4.current!.removeEventListener('input', this.paint);
    this.noiseRange2.current!.removeEventListener('input', this.paint);
  }

  // sets the noise buffers to the values generated from this seed
  // then paints
  updateNoise = (seed: number) => {
    const noise4D = makeNoise4D(seed);

    const scaledNoiseGen = (scale: number) => (x: number, y: number) => {
      const R = 1;
      const r = 1;
      const theta = (x / (this.props.width / 2)) * Math.PI;
      const phi = (y / (this.props.height / 2)) * Math.PI;
      const noise = noise4D(
        R * Math.cos(phi) / (scale * 0.02),
        R * Math.sin(phi) / (scale * 0.02),
        r * Math.cos(theta) / (scale * 0.02),
        r * Math.sin(theta) / (scale * 0.02),
      );
      return noise;
    };

    this.noiseField128 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(128));
    this.noiseField64 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(64));
    this.noiseField32 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(32));
    this.noiseField16 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(16));
    this.noiseField8 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(8));
    this.noiseField4 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(4));
    this.noiseField2 = new ScalarMap(this.props.width, this.props.height, scaledNoiseGen(2));
  }

  handleSeedChange = () => {
    const seed = this.seedInput.current!.value;
    this.updateNoise(parseInt(seed));
    this.paint();
  }

  // uses the provided weights and parameters along with the noise buffers to produce an image
  computeImage = (
    heightOffset: number,
    weight128: number,
    weight64: number,
    weight32: number,
    weight16: number,
    weight8: number,
    weight4: number,
    weight2: number,

  ) => {
    let weightSum = 0;
    weightSum += weight128;
    weightSum += weight64;
    weightSum += weight32;
    weightSum += weight16;
    weightSum += weight8;
    weightSum += weight4;
    weightSum += weight2;

    const noiseField128Arr = this.noiseField128.getData();
    const noiseField64Arr = this.noiseField64.getData();
    const noiseField32Arr = this.noiseField32.getData();
    const noiseField16Arr = this.noiseField16.getData();
    const noiseField8Arr = this.noiseField8.getData();
    const noiseField4Arr = this.noiseField4.getData();
    const noiseField2Arr = this.noiseField2.getData();

    const data = new ScalarMap(this.props.width, this.props.height);
    const dataArr = data.getData();


    // first compute logical data
    for (let i = 0; i < dataArr.length; i++) {
      dataArr[i] += noiseField128Arr[i] * weight128;
      dataArr[i] += noiseField64Arr[i] * weight64;
      dataArr[i] += noiseField32Arr[i] * weight32;
      dataArr[i] += noiseField16Arr[i] * weight16;
      dataArr[i] += noiseField8Arr[i] * weight8;
      dataArr[i] += noiseField4Arr[i] * weight4;
      dataArr[i] += noiseField2Arr[i] * weight2;
      dataArr[i] = dataArr[i] / weightSum;
      dataArr[i] += heightOffset;
    }

    // now squish down to render
    for (let i = 0; i < dataArr.length; i++) {
      dataArr[i] += (dataArr[i] + 1)/2;
    }



    return thresholdHeightMap(data, 0.5, [0x07, 0x66, 0x78]);
  }

  paint = () => {
    const heightOffset = this.heightOffsetRange.current!.valueAsNumber;

    const weight128 = this.noiseRange128.current!.valueAsNumber;
    const weight64 = this.noiseRange64.current!.valueAsNumber;
    const weight32 = this.noiseRange32.current!.valueAsNumber;
    const weight16 = this.noiseRange16.current!.valueAsNumber;
    const weight8 = this.noiseRange8.current!.valueAsNumber;
    const weight4 = this.noiseRange4.current!.valueAsNumber;
    const weight2 = this.noiseRange2.current!.valueAsNumber;

    this.setState({
      img: this.computeImage( //
        heightOffset, //
        weight128, //
        weight64, //
        weight32, //
        weight16, //
        weight8, //
        weight4, //
        weight2, //
      )
    });
  }

  render() {
    return <div style={this.props.style} className={this.props.className}>
      <div className="row">
        <div className="col-8 d-flex">
          <ImageDataDisplay
            data={this.state.img}
            className="border border-dark align-self-center w-100"
          />
        </div >
        <div className="col-md-3">
          <div className="border border-dark p-3 mb-3">
            <h6>Parameters</h6>
            <div className="form-group">
              <label className="form-label">Sea Level</label>
              <input type="range" className="form-range" min="-0.5" max="0.5" step={0.05} defaultValue={this.props.defaultHeightOffset} ref={this.heightOffsetRange} />
            </div>
            <div className="form-group">
              <label className="form-label">Seed</label>
              <div className="row">
                <div className="col-8">
                  <input className="form-control form-control-sm" type="text" defaultValue={this.props.defaultSeed} ref={this.seedInput} />
                </div>
                <div className="col-4">
                  <button className="btn btn-primary btn-sm" ref={this.seedSet}>Submit</button>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-dark p-3 w-100">
            <h6>Noise Octaves</h6>
            <div className="form-group">
              <label className="form-label">128</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise128} ref={this.noiseRange128} />
            </div>
            <div className="form-group">
              <label className="form-label">64</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise64} ref={this.noiseRange64} />
            </div>
            <div className="form-group">
              <label className="form-label">32</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise32} ref={this.noiseRange32} />
            </div>
            <div className="form-group">
              <label className="form-label">16</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise16} ref={this.noiseRange16} />
            </div>
            <div className="form-group">
              <label className="form-label">8</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise8} ref={this.noiseRange8} />
            </div>
            <div className="form-group">
              <label className="form-label">4</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise4} ref={this.noiseRange4} />
            </div>
            <div className="form-group">
              <label className="form-label">2</label>
              <input type="range" className="form-range" min="1" max="100" step="1" defaultValue={this.props.defaultNoise2} ref={this.noiseRange2} />
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default FractalNoiseTerrainDemo;
