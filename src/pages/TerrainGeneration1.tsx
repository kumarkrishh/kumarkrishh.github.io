import React from 'react';
import ArticleLayout from '../components/ArticleLayout';
import Section from '../components/Section';
import HrefLink from '../components/HrefLink';

import { fetchText } from '../utils/load';

import { Async } from 'react-async';
import { makeNoise2D, makeNoise3D, makeNoise4D } from 'open-simplex-noise';

import TeX from '@matejmazur/react-katex';

import ScalarMap from '../utils/ScalarMap';
import { grayscaleMap, thresholdHeightMap } from '../utils/map';



import { Prism as SyntaxHighligher } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import AsideCard from '../components/AsideCard';
import ImageDataDisplay from '../components/ImageDataDisplay';
import ZoomableImageDataDisplay from '../components/ZoomableImageDataDisplay';
import { loadImage, extend, boxBlur, imageDataFromFn } from '../utils/image';

import WrappingNoise3TsUrl from "../assets/terrain_generation/wrapping_noise3_ts.txt?url";
import WrappingNoise4TsUrl from "../assets/terrain_generation/wrapping_noise4_ts.txt?url";
import MugAndTorusMorphUrl from "../assets/terrain_generation/Mug_and_Torus_morph.gif";
import ColorWheelUrl from "../assets/terrain_generation/ColorWheel.png";
import TorusLabeledUrl from "../assets/terrain_generation/TorusLabeled.png";
import SimplyConnectedRegionExample1 from "../assets/terrain_generation/SimplyConnectedRegionExample1.png";
import SimplyConnectedRegionExample2 from "../assets/terrain_generation/SimplyConnectedRegionExample2.png";
import SimplyConnectedRegionExample3 from "../assets/terrain_generation/SimplyConnectedRegionExample3.png";

import VerticallySimpleRegionExample1 from "../assets/terrain_generation/VerticallySimpleRegionExample1.png";
import VerticallySimpleRegionExample2 from "../assets/terrain_generation/VerticallySimpleRegionExample2.png";

// demos
import SingularityDemo from '../components/SingularityDemo';
import TorusDemo from '../components/TorusDemo';
import FractalNoiseTerrainDemo from '../components/FractalNoiseTerrainDemo';


const noise2D = makeNoise2D(Date.now());
const noise3D = makeNoise3D(Date.now());
const noise4D = makeNoise4D(Date.now());

const TerrainGeneration = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section id="overview" name="Overview">
      <h4>Goals</h4>
      <p>
        Our goal in this series of articles will be to procedurally generate and simulate a small game world.
        There are hundreds of ways to do this, and as we go along, we'll explore some of the different strategies we could have chosen and their tradeoffs.
      </p>
      <h4>Rationale</h4>
      <p>
        Procedural generation is a versatile tactic in game programming.
        Games that utilize procedural generation can have much larger maps than those with handcrafted levels, since they can generate content on the fly.
        (
        Ex. Minecraft<Citation source="https://en.wikipedia.org/wiki/Minecraft" /> and
        No Man's Sky <Citation source="https://en.wikipedia.org/wiki/No_Man%27s_Sky" />
        )
        However, a potential downside is that excessive use of procedural generation makes games feel predictable and repetitive.
        In order to mitigate this, some games increase the depth of the world by using more elaborate generation systems.
        Dwarf Fortress, for example, even <a href="https://dwarffortresswiki.org/index.php/DF2014:World_generation">simulates an entire virtual history</a>.
        In the following sections, we'll discuss some techniques that could be used to procedurally generate content for a hypothetical game.
      </p>
      <h4>Key Decisions</h4>
      <p>
        In summary, our key techniques are as follows:
      </p>
      <ul>
        <li>Finite (but large) world</li>
        <li>Square grid as fundamental data structure</li>
        <li>World level procedural generation done at worldgen time, chunk level procedural generation done at runtime.</li>
        <li>Donut world (Periodic Boundary Conditions)</li>
        <li>Detailed biome and weather simulations</li>
        <li>Hydraulic Erosion (Fjords and River Valleys)</li>
        <li>Simulating History</li>
      </ul>
      <p>
        To keep things interesting, we'll make our game world unique by putting it on a torus planet.
        This will have a ton of effects on the terrain, climate, and overall environment.
      </p>
      <h4>In this article</h4>
      <p>
        In this article specifically, we'll decide on the game world's topology and generate the height map.
      </p>
    </Section>
    <Section id="topology" name="World Topology">
      <h4>Topology</h4>
      <p>
        Our first (and perhaps biggest) major choice is deciding on the world's <strong>topology</strong>.
      </p>
      <AsideCard title="Topology">
        <strong>Topology</strong> describes the fundamental geometric properties of an object, especially those properties that don't change as the object is stretched, squished, or otherwise distorted.
        For example, a coffee mug is topologically equivalent to a donut since the mug, like the donut, has one through hole.
        <figure className="text-center my-3">
          <img src={MugAndTorusMorphUrl} className="border border-dark mx-auto d-block" alt="A mug morphing into a torus and back" />
          <figcaption>Source: <a href="https://commons.wikimedia.org/wiki/File:Mug_and_Torus_morph.gif">Wikipedia</a></figcaption>
        </figure>
        If you're interested, <a href="https://en.wikipedia.org/wiki/Topology">you can read more about topology on Wikipedia</a>.
      </AsideCard>
      <p>
        For our purposes, however, we want to know how the world should be shaped:
      </p>
      <ul>
        <li>Is it 2D or or 3D?</li>
        <li>Infinite or finite?</li>
        <li>Flat or Sphere?</li>
        <li>Boundary Conditions?</li>
      </ul>
      <p>
        We will answer each of these questions in turn.
      </p>


      <h4>3D or 2D?</h4>
      <p>
        In this article, we'll choose a 3D game since it tends to be easier to adapt a 3d algorithm to a 2d world than the other way around.
        However, it's important to note: just because our game world is 3D doesn't mean we always need to use a 3D data structure when generating the world.
        If we guarantee that for each point on our world's surface, the elevation is a well defined number, then we can use a 2d graph or grid to represent the heightmap.
      </p>
      <p>
        However, heightmaps won't work if our terrain isn't <strong>vertically simple</strong>.
      </p>
      <AsideCard title="Vertically Simple Regions">
        <p>
          In math, a <strong>region</strong> is a <a href="https://en.wikipedia.org/wiki/Connected_space">simply connected</a> area of space.
        </p>
        <div className="row my-3">
          <figure className="col text-center">
            <img alt="Example of region" className="d-block mx-auto" style={{ width: "15em" }} src={SimplyConnectedRegionExample1} />
            <figcaption>Source: Own Work</figcaption>
            <p>This blob is a region.</p>
          </figure>
          <figure className="col text-center">
            <img alt="Example of region" className="d-block mx-auto" style={{ width: "15em" }} src={SimplyConnectedRegionExample2} />
            <figcaption>Source: Own Work</figcaption>
            <p>This example is irregular, but also a region. (All parts are connected.)</p>
          </figure>
          <figure className="col text-center">
            <img alt="Example of a non region" className="d-block mx-auto" style={{ width: "15em" }} src={SimplyConnectedRegionExample3} />
            <figcaption>Source: Own Work</figcaption>
            <p>
              This example is <strong><em>NOT</em></strong> a region since its broken in two parts.
              (Not simply connected.)
            </p>
          </figure>
        </div>

        <p>
          A <strong>vertically simple</strong> region is a region where a line can be drawn vertically and only cross the region once.
        </p>
        <div className="row my-3">
          <figure className="col text-center">
            <img alt="Example of region" className="d-block mx-auto" style={{ width: "15em" }} src={VerticallySimpleRegionExample1} />
            <figcaption>Source: Own Work</figcaption>
            <p>
              We can draw a vertical line at every point on this image, and it will only cross the region's boundary once.
              Therefore, this region is vertically simple.
            </p>
          </figure>
          <figure className="col text-center">
            <img alt="Example of region" className="d-block mx-auto" style={{ width: "15em" }} src={VerticallySimpleRegionExample2} />
            <figcaption>Source: Own Work</figcaption>
            <p>
              This example is <strong><em>NOT</em></strong> vertically simple since we can draw a line down the center that crosses the region's boundary twice.
            </p>
          </figure>
        </div>
      </AsideCard>
      <p>
        For example, if we want our world to be primarily cave based, with no real "surface" to speak of, then a given (x, y) coordinate pair may have multiple surfaces at different z levels.
        The same problem would apply for a floating island map.
        A possible workaround would be to use a small number of discrete z levels, each of which uses its own seperate heightmap.
        This approach is less efficient compared to a single heightmap, but since each per unit heightmap is smaller, it may still be feasible.
      </p>
      <h4>Infinite or Finite?</h4>
      <p>
        If we don't have any complex build time systems, then we can make our world size effectively infinite, and just generate everything at runtime.
        This is the approach Minecraft takes.<Citation source="https://en.wikipedia.org/wiki/Minecraft" />
        In some ways, this is optimal:
        The user doesn't have to wait at all for world generation, and we have a lot of flexibility with how large the map should be.
      </p>
      <p>
        However, an infinite world bars us from doing deeper simulations that require knowledge of the game map ahead of time.
        We can't generate realistic rivers, glaciers, or historical simulations in such a world.
        For this reason, we'll choose a finite, but reasonably large, size.
      </p>
      <h4>Flat or Sphere?</h4>
      <p>
        Spherical worlds are more realistic, so if creating an accurate simulation is important, spheres are the way to go.
        Spherical geometry is also required if you want to be able to render the planet's surface from space.
      </p>
      <p>
        However, spherical geometry is incompatible with voxel tiling over the surface.
        If we tile over the surface of a sphere with a square grid, we will end up with at least a few <strong>singularities</strong>.
      </p>
      <AsideCard title="Singularities">
        <p>
          The most common use of the word <strong>singularity</strong> is in reference to the center of a black hole, where gravity is infinitely strong.
          However, a singularity can refer to any point where a mathematical function is undefined or has a undefined derivative.
        </p>
        <SingularityDemo className="mx-auto" style={{ width: "20em" }} size={400} />
        <p>
          The demo above shows a simple way to tile a sphere using squares.
          In the context of using a square grid to title over a sphere, singularties are points where our regular grid breaks down.
          Notice how each corner square tile will be missing one diagonal neighbor, resulting in angles near it being highly distorted.
          So in this case singularities appear at the corners of the cube.
        </p>
        <p>
          In general though, there is no way to tile a sphere using a regular square grid.
          There will always be tiles with less than the normal number of neighboring tiles.
        </p>
      </AsideCard>
      <p>
        Since dealing with spheres is a needless hassle unless we have a specific use case, we're going to try to use a flat surface without curvature.
        This will enable us to use a grid when processing the data.
      </p>

      <h4>Boundary Conditions?</h4>
      <p>
        Now that we've settled on a flat finite surface, we have to decide what should go at the edges.
        However, we need to do more than just decide the content of the edge grid tiles.
        Many map operations need to access data from neighboring tiles.
        So, in order to process the edge tiles, we need to gather data from "beyond the edge".
      </p>
      <p>
        A <strong>boundary condition</strong> is a constraint on how we treat operations that go over the edges.
      </p>
      <p>
        We'll use a box blur in order to demonstrate the impacts of boundary conditions.
      </p>
      <AsideCard title="Blurring And Boundary Conditions">
        <Async promise={
          loadImage(ColorWheelUrl)
            // we want to be able to change radius
            .then(x => ({ img: x, radius: 100 }))
        }>
          {({ setData }) => <>
            <Async.Pending>
              <div className="spinner-border" role="status" />
            </Async.Pending>
            <Async.Fulfilled<{ img: ImageData, radius: number }>>{({ img, radius }) => {

              const fixedData = extend(img, "FIXED", radius)
              const mirrorData = extend(img, "MIRROR", radius)
              const periodicData = extend(img, "PERIODIC", radius)

              const fixedBlur = boxBlur(fixedData, radius);
              const mirrorBlur = boxBlur(mirrorData, radius);
              const periodicBlur = boxBlur(periodicData, radius);

              return <div className="container">
                <div className="mx-auto text-center my-3" style={{ width: "20em" }}>
                  <p><strong>Source Image</strong></p>
                  <ImageDataDisplay
                    style={{ width: "15em", height: "15em" }}
                    className="border border-dark mx-auto d-block"
                    data={img}
                  />
                  <small>Source: <a href="https://commons.wikimedia.org/wiki/File:Eight-colour-wheel-2D.png">Wikipedia</a></small>
                  <div className="mx-auto d-block mt-3">
                    <label className="form-label">Blur Radius</label>
                    <input type="range" className="form-range" min="1" max="120" defaultValue="60"
                      onChange={e => setData({ radius: e.target.valueAsNumber, img })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <strong>Fixed Boundary Condition</strong>
                    <p>After extension:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={fixedData}
                    />
                    <p>Final Result:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={fixedBlur}
                    />
                  </div>
                  <div className="col">
                    <strong>Mirrored Boundary Condition</strong>
                    <p>After extension:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={mirrorData}
                    />
                    <p>Final Result:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={mirrorBlur}
                    />
                  </div>
                  <div className="col">
                    <strong>Periodic Boundary Condition</strong>
                    <p>After extension:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={periodicData}
                    />
                    <p>Final Result:</p>
                    <ImageDataDisplay
                      className="border border-dark"
                      style={{ width: "15em", height: "15em" }}
                      data={periodicBlur}
                    />
                  </div>
                </div>
              </div>
            }}
            </Async.Fulfilled>
          </>}
        </Async>
      </AsideCard>
      <p>Essentially:</p>
      <ul>
        <li>Fixed boundary conditions extend the value that was closest to the edge.</li>
        <li>Mirrored boundary conditions make a mirror the data on the side closest.</li>
        <li>Periodic boundary conditions take data from the opposite edge of the image.</li>
      </ul>
      <p>Note how the choice of the boundary condition makes a huge impact on the final blurred image.</p>
      <p>
        All of these boundary conditions are workable for our purposes.
        We're going to choose a periodic boundary condition though, since it means we don't have to deal with invisible world barriers.
        This is the same approach taken by a lot of old RPGs, like Final Fantasy.
        <Citation source="https://tvtropes.org/pmwiki/pmwiki.php/Main/VideoGameGeography" />
      </p>
      <p>
        Unlike a spherical world, creating a coordinate system is straightforward on a toroidal world.
        We can simply index into our rectangular array using a x coordinate and a y coordinate.
      </p>
    </Section>
    <Section id="torusWorld" name="A Torus World" >
      <h4>Topology of Periodic Boundary Conditions</h4>
      <p>
        Periodic boundary conditions imply that the world forms a torus.
      </p>
      <p>
        If we were to glue together the top and bottom edges of the map, we would get a cylinder.
        Then, as we glue the east and west ends of the cylinder together, we would get a torus.
      </p>
      <AsideCard title="Torus Widget" id="torus-demo">
        <p>
          Play with this interactive widget to explore how we can join the edges of a rectangle to form a torus.
        </p>
        <TorusDemo
          className="mx-auto"
          style={{ maxWidth: "30em" }}
          size={400}
          texture={imageDataFromFn(200, 200, (x, y) => {
            const txsize = 200;
            const tysize = 200;
            if (x === 0 || x === txsize - 1) {
              return 0xdc3545;
            } else if (y === 0 || y === tysize - 1) {
              return 0x6610f2;
            } else {
              const count = 10;
              const a = Math.floor(x / (txsize / count)) % 2;
              const b = Math.floor(y / (tysize / count)) % 2;
              if (a + b == 1) {
                return 0xEBDBB2;
              } else {
                return 0x1d2021;
              }
            }
          })}
          aspectRatio={2}
          detailLevel={40}
        />
      </AsideCard>
      <h4>Real World Implications</h4>
      <p>
        It's actually technically possible (although very unlikely) for torus shaped planets to exist in the universe.
        However, there are a lot of unexpected implications of such a strange layout.
        For one, the gravity on the planet will vary depending where you are: high near the poles and low near the inner and outer edges.
        In addition, the torus can cast a shadow on itself, leading to strange day/night patterns and seasons.
      </p>
      <p>
        If you'd like to learn more, here are a few articles on the topic:
      </p>
      <ul>
        <li><HrefLink href="http://www.aleph.se/andart/archives/2014/02/torusearth.html" /></li>
      </ul>
      <p>
        In this project, we'll take into account many of the effects of a torus world, like the day/night cycle, and the difference between the inner and outer radiuses.
        However, we'll also show how these effects work on a nontoroidal surface like a plane or sphere.
      </p>
    </Section>
    <Section id="elevation" name="Finding Elevation">
      <p>
        The first part of our world generation process is finding the elevation.
        This will help later determine where to place the oceans, where biomes go, and much more.
        We'll represent our elevation using a rectangular grid, since it works well with our choice of a torus world.
      </p>
      <p>
        We'll generate the elevation by sampling noise for each point on our grid.
        In order to do so, we need a source of <strong>coherent noise</strong>.
      </p>
      <AsideCard title="Coherent Noise" >
        <p>If we try to fill a grid with normal noise, using something like <code className="ms-1 me-1">Math.random()</code>, this is what we would get:</p>
        <ZoomableImageDataDisplay
          className="mx-auto mb-3"
          zoomRadius={5}
          displayHeight={240}
          data={grayscaleMap(new ScalarMap(240, 240, Math.random))}
        />
        <p>
          Let's use math to describe the signature of <code className="ms-1 me-1">Math.random</code>:
        </p>
        <TeX block>
          random: () \to \reals
        </TeX>
        <p>
          Essentially, the above function maps from nothing (an empty tuple) to a real number in the range [0, 1).
          In reality, there's some hidden state seeding the algorithm internally, but it's not accessible from the API.
        </p>
        <p>
          Importantly, the output value is not correlated to any coordinates.
          Since every the noise at every point is unrelated to its coordinates, there's no large scale structure.
          So, this kind of noise isn't suitable for terrain generation.
        </p>
        <p>
          We need to use an algorithm that's capable of generating noise such that points that are close together spatially have similar values.
          To do this, we'll need our noise to accept x and y coordinates.
        </p>
        <p>
          The function signature for our noise might look something like this:
        </p>
        <TeX block>
          coherentRandom: \reals^2  \to \reals
        </TeX>
        <p>
          It accepts a pair of real numbers, the X and Y coordinates, and spits out a real number representing the value at that region.
        </p>
        <p>This is an example of what coherent noise looks like:</p>
        <ZoomableImageDataDisplay
          className="mx-auto mb-3"
          zoomRadius={5}
          displayHeight={240}
          data={grayscaleMap(new ScalarMap(240, 240, (x, y) => noise2D(x / 20, y / 20) / 2 + 0.5))}
        />
        <p>
          You can see that every pixel has a neighboring pixel that is similarly colored.
        </p>
        <p>There are several algorithms capable of generating coherent noise:</p>
        <ul>
          <li><a href="https://en.wikipedia.org/wiki/Perlin_noise">Perlin Noise</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Simplex_noise">Simplex Noise</a></li>
          <li><a href="https://en.wikipedia.org/wiki/OpenSimplex_noise">OpenSimplex Noise</a></li>
        </ul>
        <p>We'll be using OpenSimplex since it's open source and provides good performance.</p>
      </AsideCard>
      <p>
        Now that we've got our coherent noise, it's time to start putting things together.
      </p>
      We need to:
      <ul>
        <li>Make our noise wrap across the boundaries of the rectangle.</li>
        <li>Make our noise more realistic.</li>
      </ul>
      <h4>Wrapping noise</h4>
      <p>
        When we say that we want our noise to wrap around the boundaries of the rectangle,
        what we mean is that there must be a seamless transition between the left and right edges
        of the rectangle as well as the top and bottom edges.
      </p>
      <p>
        Let's look at an example of what might happen if the texture doesn't wrap when we put it on the torus.
      </p>
      <AsideCard title="Nonwrapping Texture" id="nonwrapping-textures-demo">
        <TorusDemo
          className="mx-auto"
          style={{ maxWidth: "30em" }}
          size={400}
          texture={grayscaleMap(new ScalarMap(400, 400, (x, y) => noise2D(x / 20, y / 20) / 2 + 0.5))}
          aspectRatio={2}
          detailLevel={20}
        />
      </AsideCard>
      <p>
        The solution to this problem is actually pretty intuitive.
        Right now, what we're doing is making a 2D sheet, and sampling 2D noise.
        The problem is that points that are close together in 3D are far away in 2D, so we get seams.
        Instead, why don't we start with a blank 2D sheet, roll it up into a torus, and then sample 3D noise?
        This would mean that regions that are adjacent in 3D space would have similar noise values, even if their 2D coordinate were far away.
      </p>
      <p>
        Let's give it a try.
        But first, we have to be able to mathematically describe a torus in terms of two coordinates.
        We know this is possible, since we were able to convert a rectangle (which can be indexed with x and y coordinates) into a torus.
      </p>
      <p>
        In general, the term for this kind of thing is <strong>parameterization</strong>.
      </p>
      <AsideCard title="Parametric Functions and Surfaces">
        <p>
          A <strong>parametric function</strong> is a function that maps from a set of
          independent input variables called <strong>parameters</strong> to a point in space.
        </p>
        <details className="mb-3 mx-5">
          <summary>Example</summary>
          <p>
            Imagine a ball thrown in the air with an upward velocity of 8 m/s and a horizontal velocity of 7 m/s.
          </p>
          <p>
            We know that the ball will continue to move sideways at a rate of 7 m/s, so we can say:
          </p>
          <TeX block>
            x(t) = 7t
          </TeX>
          <p>
            In addition, we know that the ball will accelerate downwards at a rate of 10 m/s<sup>2</sup> due to gravity.
            Using our basic kinematics knowledge that:
          </p>
          <TeX block>{String.raw`
            x(t) = \frac {1} {2} at^2 + vt + x
          `}</TeX>
          We can conclude that:
          <TeX block>
            y(t) = -5t^2 + 8t
          </TeX>
          <p>
            We can now make a parametric function mapping from time (the parameter) to a location in space.
            This is a parametric function!
          </p>
          <TeX block>{String.raw`
            r(t) =
            \begin{bmatrix}
              7t \\
              -5t^2 + 8t
            \end{bmatrix}
          `}</TeX>
        </details>
        <p>
          Parametric functions with 2 parameters are commonly used to describe 3D surfaces.
          A <strong>parameterization</strong> of a surface is parametric function with the signature:
        </p>
        <TeX block>
          r: \reals^2 \to \reals^3
        </TeX>
        <p>
          It maps from a 2D parameter space to a 3D surface.
        </p>
        <p>
          Khan Academy is a good resource for learning more about parametric functions:
        </p>
        <ul>
          <li><HrefLink href="https://www.khanacademy.org/math/ap-calculus-bc/bc-advanced-functions-new" /></li>
          <li><HrefLink href="https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/ways-to-represent-multivariable-functions/a/parametric-functions-two-parameters" /></li>
        </ul>
      </AsideCard>
      <p>
        Before we can parameterize our torus, we have to define its properties:
      </p>
      <ul>
        <li><strong>Major Radius</strong>: the distance from the center of the torus to the center of the tube (denoted <TeX>R</TeX>)</li>
        <li><strong>Minor Radius</strong>: the radius of the tube (denoted <TeX>r</TeX>)</li>
        <li><strong>Aspect Ratio</strong>: the ratio of the major radius to the minor radius, <TeX>{String.raw`\frac {R} {r}`}</TeX></li>
      </ul>
      <figure className="text-center my-3">
        <img src={TorusLabeledUrl}
          className="border border-dark mx-auto d-block"
          alt="Torus labeled with minor and major radiuses"
          style={{ width: "30rem" }}
        />
        <figcaption>Source: <a href="https://commons.wikimedia.org/wiki/File:Torus_cycles.svg">Wikipedia</a></figcaption>
      </figure>
      <p>
        The torus we're dealing with has <TeX>R = 2</TeX> and <TeX>r = 1</TeX>.
      </p>
      <p>
        The parameterization of a torus with major radius <TeX>R</TeX> and minor radius <TeX>r</TeX> is given by the function:
      </p>
      <TeX block>{String.raw`
        r(\theta, \phi) =
        \begin{bmatrix}
          (R + r\cos \theta) \cos \phi \\
          (R + r\cos \theta) \sin \phi \\
          r \sin \theta
        \end{bmatrix}
      `}</TeX>
      <p>
        We can gain a better intuition for how this function works if we understand what <TeX>\theta</TeX> and <TeX>\phi</TeX> really do.
      </p>
      <ul>
        <li><TeX>\theta</TeX> represents rotation around the tube</li>
        <li><TeX>\phi</TeX> represents rotation around the center axis</li>
      </ul>
      <p>
        It may be helpful to scroll up and open the "Advanced Torus Controls" box on the <a href="#nonwrapping-textures-demo">nonwrapping textures demo</a>.
        Try moving the Alpha slider to the max and then seeing what effect changing the major and minor radiuses have.
      </p>
      <p>
        Let's put it all together:
      </p>
      <ul>
        <li>Our inputs are:
          <ul>
            <li>Dimensions of the output array (width and height)</li>
            <li>Major radius of torus</li>
            <li>Minor radius of torus</li>
            <li>Scaling factor for noise</li>
            <li>3D Noise function</li>
          </ul>
        </li>
        <li>Our outputs are:
          <ul>
            <li>2D array with specified dimensions containing the noise</li>
          </ul>
        </li>
      </ul>
      <p>
        Here's the code:
      </p>
      <Async promise={fetchText(WrappingNoise3TsUrl)}>
        <Async.Pending>
          <div className="spinner-border" role="status" />
        </Async.Pending>
        <Async.Fulfilled<string>>{code =>
          <SyntaxHighligher className="mx-5" language="typescript" showLineNumbers style={a11yDark}>{code}</SyntaxHighligher>
        }</Async.Fulfilled>
        <Async.Rejected>
          {/* TODO: put error here */}
          <div className="spinner-border" role="status" />
        </Async.Rejected>
      </Async>
      <p>
        And here's what the texture looks like:
      </p>
      <AsideCard title="Wrapping Texture" id="torus3-textures-demo">
        <TorusDemo
          className="mx-auto"
          style={{ maxWidth: "30em" }}
          size={400}
          aspectRatio={2}
          texture={grayscaleMap(new ScalarMap(400, 400, (x, y) => {
            const scale = 0.3;
            const R = 2;
            const r = 1;
            const theta = (x / 200) * Math.PI + Math.PI;
            const phi = (y / 200) * Math.PI;
            const noise = noise3D(
              (R + r * Math.cos(theta)) * Math.cos(phi) / scale,
              (R + r * Math.cos(theta)) * Math.sin(phi) / scale,
              r * Math.sin(theta) / scale,
            );
            return noise / 2 + 0.5;
          }
          ))}
          detailLevel={20}
        />
      </AsideCard>
      <h4>Overcoming Distortion</h4>
      <p>
        If we look closely at the above demo's texture (when flat), we'll see an interesting phenomenon:
        the center of the texture looks regular, but the left and right edges seem squished vertically.
        This is an example of <strong>distortion</strong>, undesirable stretching or squishing that occurs when mapping a 3d surface to a plane.
      </p>
      <p>
        In this case, distortion occurs due to the difference between the inner and outer radiuses of the torus.
        The inner radius is <TeX>R - r</TeX> and the outer radius is <TeX>R + r</TeX>.
        So, the ratio of stretching that occurs between the inner and outer radiuses is:
      </p>
      <TeX block>{String.raw`
          s = \frac {R + r} {R - r}
      `}</TeX>
      <p>
        Essentially, what this tells us is that the lower the aspect ratio, the higher the distortion will be.
        For relatively low aspect ratios like our torus, the distortion ratio can be large.
        The torus displayed in the demo has a distortion ratio of 3, which is very significant.
      </p>
      <p>
        Whether or not distortion is a problem depends on the type of game you're building.
        If you don't use voxels, then its relatively simple to correct.
        The problem with distortion for voxel video games is that it means that object sizes change depending
        on where you are on the world. There are 2 potential solutions, and both have problems.
      </p>
      <p>
        The simplest solution is to simply ignore distortion, and just display a voxel as a meter length cube anywhere on the world.
        However, this would mean that mountains will look extremely squished on the outer radius, since they would be 3 times narrower in one direction than in the other.
      </p>
      <p>
        Alternatively, we could scale voxels depending on location in the world.
        If you stand on the inner radius, a voxel would look normal.
        However, on the outer radius, that same voxel would appear to be a rectangular prism, 3 times longer than it was wide.
        This solves the problem of terrain looking squished, since the voxels would be larger to compensate.
        However, it means that dungeons or player built structures will be heavily distorted.
      </p>
      <p>
        If the distortion ratio were small, the problems could be minor enough to ignore.
        With a distortion ratio of 3, however, these problems must be addressed somehow.
      </p>
      <h4>Cheating using the 4th dimension</h4>
      <p>
        In the following section, we'll describe a method to eliminate distortion at the expense of physical realism.
        However, it may not be necessary depending on your requirements.
      </p>
      <p>
        In the last section, we used a 3D noise function to get a texture that wraps across a torus seamlessly.
        Unfortunately, our texture suffered from distortion, preventing us from using voxels.
      </p>
      <p>
        This problem is present in all toruses embedded in 3D space.
        The fundamental reason why is revealed when we take a look at the parametric equation once again:
      </p>
      <TeX block>{String.raw`
        r(\theta, \phi) =
        \begin{bmatrix}
          (R + r\cos \theta) \cos \phi \\
          (R + r\cos \theta) \sin \phi \\
          r \sin \theta
        \end{bmatrix}
      `}</TeX>
      <p>
        Notice how changing <TeX math="\phi" /> changes both x and y, while
        changing <TeX math="\theta" /> changes x, y and z.
        There simply aren't enough degrees of freedom for the variables changed by <TeX math="\phi" /> be independent from the variables changed by <TeX math="\theta" />.
        This manifests as the difference between the inner and outer radiuses.
        When <TeX math="\theta = 0" />, the ring traced by varing <TeX math="\phi" /> has a greater radius than when <TeX math="\theta = \pi" />.
      </p>
      <p>
        In order to get the degree of freedom necessary, we need to add another dimension.
      </p>
      <p>
        OpenSimplex supports up to 4 dimensions, so we're able to define the following function:
      </p>
      <TeX block>
        coherentRandom4: \reals^4  \to \reals
      </TeX>
      <p>
        Using this new noise function, we can try to think of a new parameterization of a torus that keeps the variables changed by <TeX math="\phi" /> seperate from the variables changed by <TeX math="\theta" />.
        This turns out to be pretty easy:
      </p>
      <TeX block>{String.raw`
        r(\theta, \phi) =
        \begin{bmatrix}
          R \cos \phi \\
          R \sin \phi \\
          r \cos \theta \\
          r \sin \theta
        \end{bmatrix}
      `}</TeX>
      <p>
        You can think of this new 4D torus as a kind of double cylinder.
        It simultaneously manages to roll up a 2D square by connecting its top and bottom edges, as well as its left and right edges.
        Varying the <TeX math="\phi" /> coordinate traces out a circle in the <TeX>xy</TeX> plane.
        Varying the <TeX math="\theta" /> coordinate traces out a circle in the <TeX>zw</TeX> plane.
      </p>
      <p>
        Mathematically, the shape we've described is called a <strong>flat torus</strong><Citation source="https://en.wikipedia.org/wiki/Torus#Flat_torus" />.
      </p>
      <p>
        So, let's use our new definition to generate a texture:
      </p>
      <Async promise={fetchText(WrappingNoise4TsUrl)}>
        <Async.Pending>
          <div className="spinner-border" role="status" />
        </Async.Pending>
        <Async.Fulfilled<string>>{code =>
          <SyntaxHighligher className="mx-5" language="typescript" showLineNumbers style={a11yDark}>{code}</SyntaxHighligher>
        }</Async.Fulfilled>
        <Async.Rejected>
          {/* TOOD: put error here */}
          <div className="spinner-border" role="status" />
        </Async.Rejected>
      </Async>
      <p>
        Here's what our texture looks like:
      </p>
      <AsideCard title="Wrapping Texture" id="torus4-textures-demo">
        <TorusDemo
          className="mx-auto"
          style={{ maxWidth: "30em" }}
          size={400}
          aspectRatio={2}
          texture={grayscaleMap(new ScalarMap(400, 400, (x, y) => {
            const scale = 0.3;
            const R = 1;
            const r = 1;
            const theta = (x / 200) * Math.PI;
            const phi = (y / 200) * Math.PI;
            const noise = noise4D(
              R * Math.cos(phi) / scale,
              R * Math.sin(phi) / scale,
              r * Math.cos(theta) / scale,
              r * Math.sin(theta) / scale
            );
            return noise / 2 + 0.5;
          }
          ))}
          detailLevel={20}
        />
      </AsideCard>
      <p>
        Although looking a little bit stretched, the texture is seamless.
        When flat, it's also distortion free.
      </p>
      <p>
        However, this solution is a little bit of "cheating" on our part, since this isn't a torus that could form in 3D space.
        In addition, another downside of this method is that the texture generated from this process doesn't actually correspond to the shape of the torus in 3D space.
        It won't be noticeable from the player's perspective, but if we want to render the torus from space, we'll run into problems.
      </p>
      <h4>More realistic noise</h4>
      <p>
        Now that we have our noise, let's try making a map.
        Note that this section is unrelated to our torus parametrization.
        We'll use normal 2D noise in this section to keep things simple, but the methods here are generally applicable to all kinds of noise.
      </p>
      <AsideCard title="Noise With Oceans, Attempt 1" id="noise-with-oceans-1">
        <p>
          Recall that we are sampling the value of our noise function at every point on our grid to produce an elevation map.
          This will be a good starting point for further generation such as determining the temperature, adding erosion, and more.
        </p>
        <p>
          OpenSimplex noise returns a value between -1 and 1.
          Let's designate this value <TeX>H</TeX> and let it designate kilometers above sea level.
        </p>
        <p>
          So, all areas where <TeX>{String.raw`H < 0`}</TeX> are underwater. We'll paint them blue.
          <br />
          If <TeX>{String.raw`H \ge 0`}</TeX>, then the area is above sea level. We'll paint those regions gray.
        </p>
        <ImageDataDisplay
          style={{ width: "20em", }}
          className="border border-dark mx-auto d-block mb-3"
          data={thresholdHeightMap(new ScalarMap(400, 400, (x, y) => {

            const scale1 = 0.005;
            const noise1 = noise2D(
              x * scale1,
              y * scale1,
            );

            return noise1 / 2 + 0.5;
          }
          ), 0.5, [0x07, 0x66, 0x78])}
        />
      </AsideCard>
      <p>
        Unfortunately, our map looks rather bland.
        There aren't any fine details on the coastlines, nor small islands.
        On land, we're missing mountains, valleys and rivers.
      </p>
      <p>
        A simple fix is to increase the <b>frequency</b>, of our noise.
        That is, we'll increase how quickly the noise can change values.
      </p>

      <AsideCard title="Noise With Oceans, Attempt 2" id="noise-with-oceans-2">
        <ImageDataDisplay
          style={{ width: "20em", }}
          className="border border-dark mx-auto d-block mb-3"
          data={thresholdHeightMap(new ScalarMap(400, 400, (x, y) => {

            const scale2 = 0.025;
            const noise2 = noise2D(
              x * scale2,
              y * scale2
            );

            return noise2 / 2 + 0.5;

          }
          ), 0.5, [0x07, 0x66, 0x78])}
        />
      </AsideCard>

      <p>
        This map definitely has more details, but it lacks any large scale structure like oceans and continents.
      </p>
      <p>
        However, there's an intuitive way to combine the strengths of both of these maps: add them together!
        <br />
        That is, if we have elevations:
      </p>
      <TeX block>{String.raw`
        H_{lowfreq} : \reals^2 \to \reals
      `}</TeX>
      <TeX block>{String.raw`
        H_{hifreq} : \reals^2 \to \reals
      `}</TeX>
      <p>
        then we can create a new weighted sum <TeX>H</TeX>:
      </p>
      <TeX block>{String.raw`
        H(\theta, \phi) = \alpha H_{lowfreq}(\theta, \phi) + \beta H_{hifreq}(\theta, \phi)
      `}</TeX>
      <p>
        Note that we can apply weights on one or more of the elevation maps.
        In general, the rule of thumb is that we want to apply higher weights to low frequency noise, otherwise you get fragmentation.
      </p>
      <p>
        Using this method, we would be able to have both large scale structure and fine details, and overall get a more natural looking terrain.
      </p>
      <AsideCard title="Noise With Oceans, Attempt 3" id="noise-with-oceans-3">
        <p>
          In this image, we add together the two noises above, giving the lower frequency noise slightly more weight.
        </p>
        <ImageDataDisplay
          style={{ width: "20em", }}
          className="border border-dark mx-auto d-block mt-3"
          data={thresholdHeightMap(new ScalarMap(400, 400, (x, y) => {

            const scale1 = 0.005;
            const noise1 = noise2D(
              x * scale1,
              y * scale1,
            );

            const scale2 = 0.025;
            const noise2 = noise2D(
              x * scale2,
              y * scale2
            );

            return (0.6 * noise1 + 0.4 * noise2) / 2 + 0.5;
          }
          ), 0.5, [0x07, 0x66, 0x78])}
        />
      </AsideCard>
      <p>
        We need not stop at two layers however.
        In the example below, we have 7 layers.
        Each layer is a multiple of two larger than the previous one.
      </p>
      <AsideCard title="Fractal Noise With Oceans" id="fractal-noise-demo">
        <FractalNoiseTerrainDemo
          className="mx-auto mb-3"
          showMountainNoise={false}
          defaultSeed={1}
          height={400}
          width={400}
          defaultHeightOffset={0.0}
          defaultNoise128={70}
          defaultNoise64={19}
          defaultNoise32={15}
          defaultNoise16={13}
          defaultNoise8={8}
          defaultNoise4={5}
          defaultNoise2={2}
        />
      </AsideCard>
      <p>
        A common name for this kind of noise is <b>fractal noise</b>,
        since the noise has the same structure on multiple scales, giving it a sort of self-similarity.
      </p>
    </Section>
    <Section id="conclusion" name="Conclusion">
      <h4>Summary</h4>
      To wrap up what we've done so far:
      <ul>
        <li>We discussed the pros and cons of different world topologies.</li>
        <li>We parameterized the torus world.</li>
        <li>We created a height map using fractal noise.</li>
      </ul>
      <h4>Next Time</h4>
      In the next article, we'll discuss the weather of a torus world.
      <ul>
        <li>What would the exact shape of a torus world be?</li>
        <li>How would the sun illuminate a torus world?</li>
        <li>What would the weather patterns be like?</li>
      </ul>
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
    <TerrainGeneration />
  </React.StrictMode>,
  document.getElementById('root')
);
