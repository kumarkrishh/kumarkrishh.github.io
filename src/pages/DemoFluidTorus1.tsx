import IncompressibleTorusFluidDemo from '../components/IncompressibleTorusFluidDemo';

function Error() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
    }}>
      <IncompressibleTorusFluidDemo
        className="mx-auto"
        xsize={400}
        ysize={400}
        torussize={400}
      />
    </div>
  )
}

import React from 'react';
import ReactDOM from 'react-dom';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

ReactDOM.render(
  <React.StrictMode>
    <Error />
  </React.StrictMode>,
  document.getElementById('root')
);
