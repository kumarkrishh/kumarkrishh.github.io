import React from 'react';

import Section from '../components/Section';
import HrefLink from '../components/HrefLink';
import ArticleLayout from '../components/ArticleLayout';

import AsideCard from '../components/AsideCard';

const TimeZoneSpacePage = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section name="Overview" id="overview">

      <p>
        In this article we'll discuss:
      </p>
      <ul>
        <li>Why our current systems for timekeeping suck.</li>
        <li>How space agencies currently deal with timezones in space.</li>
        <li>What is likely to change as we colonize the solar system.</li>
        <li>How relativity affects timekeeping</li>
        <li>A proposal for a new system of timekeeping.</li>
      </ul>
    </Section>
    <Section name="Current Systems" id="current_systems">
      <p>
      Our current system of keeping time is governed by various international organizations and countries.
      </p>
      <p>
        Here's the breakdown of responsibilities:
      </p>


      Here's the current system of time that we use:
      <ul>


      </ul>


      <AsideCard title='Time' id='time' >
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
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
    <TimeZoneSpacePage />
  </React.StrictMode>,
);
