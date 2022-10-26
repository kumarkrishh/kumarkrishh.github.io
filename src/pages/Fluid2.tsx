import React from 'react';
import ArticleLayout from '../components/ArticleLayout';
import Section from '../components/Section';
import HrefLink from '../components/HrefLink';

import { Async } from 'react-async';
import { fetchText } from '../utils/load';

import Tex from '@matejmazur/react-katex';

import AsideCard from '../components/AsideCard';

import { Prism as SyntaxHighligher } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { ArticleLink } from '../components/Articles';
import { articleData } from '../components/ArticleData';

import WebGL2SetupDemo from '../components/WebGL2SetupDemo';
import WebGL2HeatEqnDemo from '../components/WebGL2HeatEqnDemo';
import WebGL2FluidAdvectionDemo from '../components/WebGL2FluidAdvectionDemo';
import WebGL2IncompressibleFluidDemo from '../components/WebGL2IncompressibleFluidDemo';

type CodeBlockProps = {
  url: string,
  lang: string,
}

function CodeBlock(props: CodeBlockProps) {
  return <Async promise={fetchText(props.url)}>
    <Async.Pending>
      <div className="spinner-border" role="status" />
    </Async.Pending>
    <Async.Fulfilled<string>>{code =>
      <SyntaxHighligher
        className="mx-5 mb-5"
        language={props.lang}
        showLineNumbers
        style={a11yDark}
        children={code}
      />
    }</Async.Fulfilled>
    <Async.Rejected>
      {/* TODO: put error here */}
      <div className="spinner-border" role="status" />
    </Async.Rejected>
  </Async>
}

const Fluid2 = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section id="overview" name="Overview">
      <p>
        Our goals are to:
      </p>
      <ul>
        <li>explain simply the math behind fluid simulation</li>
        <li>learn how to use the Navier-Stokes equations to simulate fluids</li>
        <li>provide working code to simulate 2D incompressible flow</li>
      </ul>
      <p>
        Prerequisites:
      </p>
      <ul>
        <li><ArticleLink a={articleData.get("fluid1")!} /></li>
      </ul>
    </Section>
    <Section id="math-fluid-simulation" name="Math of Fluid Simulation">
      <h4>Prerequisites</h4>
      <p>
        This section makes heavy use of multivariable calculus, matrix multiplication, and systems of equations.
        so if you're not familiar or need a refresher, I recommend checking out these topics:
      </p>
      <ul>
        <li>
          Vector Multiplication and Matrix Multiplication
          <ul>
            <li><HrefLink href="https://www.mathsisfun.com/algebra/matrix-multiplying.html" /></li>
            <li><HrefLink href="https://mathinsight.org/matrix_vector_multiplication" /></li>
          </ul>
        </li>
        <li>
          Vector and Scalar Fields
          <ul>
            <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/ways-to-represent-multivariable-functions/a/multivariable-functions" /></li>
            <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/ways-to-represent-multivariable-functions/a/vector-fields" /></li>
          </ul>
        </li>
        <li>
          Partial Derivatives
          <ul>
            <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives" /></li>
          </ul>
        </li>
        <li>
          The Gradient of Scalar Fields
          <ul>
            <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives" /></li>
          </ul>
        </li>
        <li>
          Divergence of a Vector Field
          <ul>
            <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/divergence-and-curl-articles/a/divergence" /></li>
          </ul>
        </li>
        <li>
          Finite Differences
          <ul>
            <li><HrefLink href="https://en.wikipedia.org/wiki/Finite_difference#Relation_with_derivatives" /></li>
          </ul>
        </li>
      </ul>
      <h4>Notation</h4>
      <p>
        In this article, we'll use the following notation, which is consistent with that used by Khan Academy:
      </p>
      <ul>
        <li>
          Lowercase letters and greek letters for scalars.
          <br />
          Examples:
          <ul>
            <li><Tex math="a = 5" /></li>
            <li><Tex math="y = x^2 + 1" /></li>
          </ul>
        </li>
        <li>
          Lowercase letters and greek letters with an arrow on top for vectors.
          <br />
          Examples:
          <ul>
            <li><Tex math="\vec v = \begin{bmatrix} 1 \\ -2 \end{bmatrix}" /></li>
            <li><Tex math="\vec f = \nabla (x^2 + y^2)" /></li>
          </ul>
        </li>
      </ul>
      <h4>Navier Stokes</h4>
      <p>
        Fluids are complicated.
        If we wanted to make our simulation perfectly accurate, we would have to simulate at the molecular level,
        directly handling the elastic collisions of molecules against each other.
      </p>
      <p>
        Indeed, this intricate level of simulation is often done when dealing with high temperature plasmas.
        However, there are quite a few downsides to this.
        First of all, it's really slow.
        You'd never be able to do this on real time on consumer hardware.
        And second of all, it's very complicated.
        We want code that's easy to write and understand, even if you've never had experience in fluid simulation.
      </p>
      <p>
        The good news is that it's not necessary to go to such lengths to have a fairly realistic fluid simulation.
        Doing so would be complete overkill for most cases, which never see such extreme conditions.
        So, we'll make a few choice simplifications to make our simulation both fast and easy to understand:
      </p>
      <ol>
        <li>
          We'll assume our fluid is a continuuum
          <Citation source="https://en.wikipedia.org/wiki/Derivation_of_the_Navier%E2%80%93Stokes_equations#Basic_assumptions" />
          .
          <ul>
            <li>
              This means that the fluid is a continous substance,
              and that we can find the derivatives of fluid properties like pressure and velocity.
            </li>
            <li>
              Since all matter is made out of atoms, this isn't actually true,
              but the effects of this are negligible on the macroscopic scale.
            </li>
          </ul>
        </li>
        <li>
          We'll assume our fluid is incompressible.
          <ul>
            <li>
              In reality of course, no fluid is perfectly incompressible, but it's a close enough approximation.
              For example, water is nearly aways incompressible.
              Even for air, we only really need to start worrying about compressibility when the flow approaches Mach 0.3
              <Citation source="https://en.wikipedia.org/wiki/Compressible_flow" />
              .
            </li>
          </ul>
        </li>
        <li>
          We'll assume our fluid has no friction.
          <ul>
            <li>
              This one is probably the most egregious simplification,
              but as we'll see, inaccuracies in our simulation give us friction "for free" anyway.
            </li>
          </ul>
        </li>
      </ol>
      <p>
        When we take these assumptions and combine them with the rules of conservation of mass, and the conservation of momentum,
        we get the incompressible Navier Stokes equations:
      </p>
      <Tex block >{String.raw`
        \begin{gather}
          \frac {\partial \vec{u}} {\partial t} =
          -(\vec{u} \cdot \nabla)\vec{u}
          -\frac {1} {\rho} \nabla{p} \\
          \nabla \cdot \vec{u} = 0
        \end{gather}
      `}</Tex>
      Where:
      <ul>
        <li><Tex math="\vec u" /> is the velocity vector field</li>
        <li><Tex math="p" /> is the pressure scalar field</li>
        <li><Tex math="\rho" /> is the density of the fluid</li>
        <li><Tex math="\frac {\partial \vec{u}} {\partial t}" /> is the derivative of the velocity vector field with respect to time</li>
      </ul>
      <p>
        In our case, since we're neglecting friction, we've technically listed the Euler equations,
        which are a special case of the Navier-Stokes equations when the viscosity of the fluid is zero throughout.
        <Citation source="https://en.wikipedia.org/wiki/Euler_equations_(fluid_dynamics)" />.
        However, most what we're saying applies equally to the Navier-Stokes equations.
      </p>
      <p>
        If you're interested, a derivation of Navier Stokes can be found on Wikipedia here: <HrefLink href="https://en.wikipedia.org/wiki/Derivation_of_the_Navier%E2%80%93Stokes_equations" />,
        but it's not necessary to understand in order to implement a simulation of it.
      </p>
      <h4>Understanding the Equations</h4>
      <p>
        The equations, despite being quite short, are pretty confusing.
      </p>
      <p>
        First, we have to understand what's even going on.
        These equations, as written, are a set of equalities that we can try to apply to a scenario that has:
      </p>
      <ul>
        <li>A vector field representing velocity at any given point</li>
        <li>A vector field representing the derivative of this field with respect to time</li>
        <li>A scalar field representing the pressure at any given point</li>
        <li>A single scalar value that represents the density of the fluid</li>
      </ul>
      <p>
        If we have all 4 of these values, then we can check if they satisfy the equations.
        To do this, imagine we visit every single position on the coordinate plane, and ask: Do the fields at this position satisfy equation 1? Do they satisfy equation 2?
      </p>
      <ul>
        <li>If the answer is yes, <i>for every single point on the coordinate plane</i>, then we can say "yeah, these fields can represent an incompressible fluid"</li>
        <li>If the answer is no, <i>for even a single point</i>, then we must say "no, these fields don't represent an incompressible fluid"</li>
      </ul>
      <p>
        That's literally everything these equations let us do right now, mathematically speaking.
      </p>
      <p>
        But wait, if we have 3 values, shouldn't we be able to solve for the 4th?
      </p>
      <p>
        As it turns out, no. The Navier-Stokes equations are notoriously unsolvable in the general case.
        Given arbitrary initial conditions, we don't even yet know if a globally defined smooth pressure and velocity field that solves the equation exists.
        This problem, known as Navier-Stokes existence and smoothness, was designated one of the 7 Millenium Prize Problems,
        and anyone who solves it will recieve a million dollar prize<Citation source="https://www.claymath.org/sites/default/files/navierstokes.pdf" />.
      </p>
      <p>
        That being said, it's definitely possible to numerically approximate solutions, and this is indeed what we have to do.
        Numerically approximated solutions are never 100% accurate, and since the Navier-Stokes equations are chaotic, we'll
        eventually diverge from the true state of the fluid.
      </p>
      <p>
        For certain applications, like weather forecasting, this can be a real problem.
        For others, like video games, it's not as big of a deal.
        We're focusing on the second use case for now, so we won't worry too much about accuracy, especially where it conflicts with performance.
      </p>
      <AsideCard title="Simulating a solution to Navier-Stokes">
        <p>
          Let's walk through what we are going to do to in our simulation.
        </p>
        <ol>
        </ol>
        <p>
          In our case, we already have <Tex math="{\vec u}_{t=0}" />, <Tex math="p_{t=0}" /> and <Tex math="\rho" />, and we want to find <Tex math="{\frac {\partial \vec{u}} {\partial t}}_{t=0}" />.
          Then, we'll approximate the velocity field one timestep in the future by adding <Tex math="{\frac {\partial \vec{u}} {\partial t}}_{t=0}" /> to <Tex math="{\vec u}_{t=0}" /> to
          get <Tex math="{\vec u}_{t=1}" />
          (This method is sometimes called the "Forward Euler Method"<Citation source="https://en.wikipedia.org/wiki/Euler_method" />,
          and it's one of the simplest and most intuitive ways to solve a differential equation.)
        </p>
        <p>
          We then use <Tex math="{\vec u}_{t=1}" /> to find <Tex math="{p}_{t=1}" />.
          We will see that the pressure field can be found directly from velocity field without needing either <Tex math="\frac {\partial \vec{u}} {\partial t}" /> or <Tex math="\rho" />.
        </p>
      </AsideCard>


      <h5>Equation 1</h5>
      <Tex block math={String.raw`\frac {\partial \vec{u}} {\partial t} = -(\vec{u} \cdot \nabla)\vec{u} -\frac {1} {\rho} \nabla{p}`} />
      <ul>
        <li>
          <Tex math={String.raw`\frac {\partial \vec{u}} {\partial t}`} /> is key here.
          It
        </li>

      </ul>
    </Section>


    <Section id="webgl2-advection" name="Fluid Advection with WebGL2">
      <p>
        Now, we'll approach the heat equation
      </p>
      <AsideCard title="Fluid Advection" id="fluid-advection-demo">
        <WebGL2FluidAdvectionDemo
          className="mx-auto"
          style={{ maxWidth: "40em" }}
          size={400}
        />
      </AsideCard>
    </Section>

    <Section id="webgl2-incompressible" name="Incompressible Fluid with WebGL2">
      <p>
        Now, we'll approach the heat equation
      </p>
      <AsideCard title="Fluid Advection" id="fluid-advection-demo">
        <WebGL2IncompressibleFluidDemo
          className="mx-auto"
          style={{ maxWidth: "40em" }}
          xsize={400}
          ysize={800}
        />
      </AsideCard>
    </Section>

    <Section id="sources" name="Sources">
      <CitationBank />
    </Section>
  </>
}</ArticleLayout>


// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Fluid2 />
  </React.StrictMode>,
);
