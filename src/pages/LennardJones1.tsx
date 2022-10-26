
import React from 'react';

import Section from '../components/Section';
import HrefLink from '../components/HrefLink';
import ArticleLayout from '../components/ArticleLayout';

import AsideCard from '../components/AsideCard';

import WebGL2GravityDemo from '../components/WebGL2GravityDemo';
import LennardJonesDemo from '../components/LennardJonesDemo';

const GravityPage = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section name="Spacewar" id="spacewar">
      <p>
        <HrefLink href="https://github.com/pimpale/spacewar" />
      </p>
      <p>
        <HrefLink href="https://github.com/pimpale/GravitySimulator" />
      </p>

      <AsideCard title="Canvas Setup" id="canvas-setup-demo">
        <LennardJonesDemo
          className="mx-auto"
          style={{maxWidth: "50em"}}
          xsize={512}
          ysize={512}
        />
      </AsideCard>

    </Section>
  </>
}</ArticleLayout>

import { createRoot } from 'react-dom/client';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <GravityPage />
  </React.StrictMode>,
);
