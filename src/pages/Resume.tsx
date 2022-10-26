import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/Section';

import ResumePdfUrl from '../assets/govind_pimpale_resume.pdf?url';

const Resume = () =>
  <Layout>
    <div className="container mt-5">
      <Section id="resume" name="Resume">
        <iframe title="resume" src={ResumePdfUrl} style={{ width: "100%", aspectRatio: "0.9" }} />
      </Section>
    </div>
  </Layout>


import { createRoot } from 'react-dom/client';

// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Resume />
  </React.StrictMode>,
);
