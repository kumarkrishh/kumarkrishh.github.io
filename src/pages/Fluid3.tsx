import React from 'react';
import ArticleLayout from '../components/ArticleLayout';
import Section from '../components/Section';
import HrefLink from '../components/HrefLink';

import AsideCard from '../components/AsideCard';

import IncompressibleSphereFluidDemo from '../components/IncompressibleSphereFluidDemo';

const Fluid3 = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section id="overview" name="Overview">
      <p>
        Our goals are to:
      </p>
      <ul>
        <li>Map the fluid simulation onto a sphere.</li>
        <li>Make the fluid simulation 3D.</li>
      </ul>
    </Section>
    <Section id="Fluid3-unmapped-sphere" name="Incompressible Fluid on a Sphere">
      <p>
        Incompressible
      </p>

      {/*
      <AsideCard title="Canvas Setup" id="canvas-setup-demo">
        <IncompressibleSphereFluidDemo
          className="mx-auto"
          style={{maxWidth: "40em"}}
          xsize={400}
          ysize={400}
          spheresize={400}
        />
      </AsideCard>
      */}

      <AsideCard title="Canvas Setup" id="canvas-setup-demo">
        <IncompressibleSphereFluidDemo
          className="mx-auto"
          style={{maxWidth: "40em"}}
          xsize={400}
          ysize={400}
          spheresize={400}
        />
      </AsideCard>
    </Section>

    <Section id="sources" name="Sources">
      <CitationBank />
    </Section>
  </>
}</ArticleLayout>

import ReactDOM from 'react-dom';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

ReactDOM.render(
  <React.StrictMode>
    <Fluid3 />
  </React.StrictMode>,
  document.getElementById('root')
);
