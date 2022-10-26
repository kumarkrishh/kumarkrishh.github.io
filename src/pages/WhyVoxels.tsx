import React from 'react';

import TeX from '@matejmazur/react-katex';

import Section from '../components/Section';
import HrefLink from '../components/HrefLink';
import ArticleLayout from '../components/ArticleLayout';

import { Attribution, License } from '../components/Attribution';

import AsideCard from '../components/AsideCard';

import MinetestExample from "../assets/whyvoxels/Minetest.png";
import VelorenExample from "../assets/whyvoxels/veloren.png";
import CS174AProjectExample from "../assets/whyvoxels/cs174a_project_screenshot1.png";

import ChiralPentagonExample from "../assets/whyvoxels/P5-type15-chiral_coloring.png";
import H2TilingExample from "../assets/whyvoxels/600px-H2_tiling_237-5.png";
import CubicHoneycombExample from "../assets/whyvoxels/Cubic_honeycomb.png";

import DualExample from "../assets/whyvoxels/dual.png";
import SelfDualExample from "../assets/whyvoxels/selfdual.png";

import RhombicDodecahedronGif from "../assets/whyvoxels/RhombicDodecahedronGif.gif"
import ConstructingRhombicDodecahedron from "../assets/whyvoxels/ConstructingRhombicDodecahedron.gif"
import RhombicDodecahedra from "../assets/whyvoxels/Rhombic_dodecahedra.png"

const WhyVoxelsPage = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section name="Why are all voxels cubes?" id="why_voxels">
      <p>
        If you've ever played Minecraft, you'll notice that the world is (mostly) made up of cubes.
        It's not just Minecraft: basically every other fully destructible game (at the time of writing)
        uses cubes as the basic building block of their world.
      </p>
      <AsideCard title="Voxel Game Examples">
        <div className="row my-3">
          <figure className="col text-center">
            <img alt="screenshot from Minetest" className="d-block mx-auto" style={{ width: "20em" }} src={MinetestExample} />
            <figcaption>Source: Own Work, Using: <a href="https://www.minetest.net/">Minetest</a></figcaption>
          </figure>
          <figure className="col text-center">
            <img alt="screenshot from Veloren" className="d-block mx-auto" style={{ width: "20em" }} src={VelorenExample} />
            <figcaption><Attribution author="Piedro0" license={License.CC_BY_SA_4_0} href="https://book.veloren.net/" via="Veloren" /></figcaption>
          </figure>
          <figure className="col text-center">
            <img alt="screenshot from CS174AProject" className="d-block mx-auto" style={{ width: "20em" }} src={CS174AProjectExample} />
            <figcaption>Source: Own work, Using: <a href="../projects.html#browser-voxel-game">CS174A-Project</a></figcaption>
          </figure>
        </div>
      </AsideCard>
      <p>
        People often call games in this category "Voxel Games", since the word <b>voxel</b> is short for "<b>vo</b>lume <b>el</b>ement".
        A <a href="https://en.wikipedia.org/wiki/Voxel#Computer_games">full list</a> is available on Wikipedia.
        You'll notice that all of these games make use of a three dimensional grid of cubes.
      </p>
      <AsideCard title="Technical Note">
        <p>
          A voxel is sometimes defined as "a value on a regular grid in 3D space.",
          where a <b>regular grid</b> is defined as a tessellation of parallelepipeds.
          <Citation source="https://en.wikipedia.org/wiki/Voxel" />
          If we accept this definition, then a voxel must be a parallelepiped by definition.
        </p>
        <p>
          However, in this article I define a voxel as a "discrete element comprising a three-dimensional entity".
          <Citation source="https://www.merriam-webster.com/dictionary/voxel" />
        </p>
      </AsideCard>
      <p>
        However, in 2D games, there's a lot more variation.
        While many games use square grids, a lot of them use hexagonal grids, and even triangular ones.
      </p>
      Some notable examples of games on hex grids include:
      <ul>
        <li>
          Catan
          <Citation source="https://en.wikipedia.org/wiki/Catan" />
        </li>
        <li>
          Civilization 5
          <Citation source="https://en.wikipedia.org/wiki/Civilization_V" />
        </li>
        <li>
          Civilization 6
          <Citation source="https://en.wikipedia.org/wiki/Civilization_VI" />
        </li>
        <li>
          Heroes of Might and Magic 3
          <Citation source="https://en.wikipedia.org/wiki/Heroes_of_Might_and_Magic_III" />
        </li>
      </ul>
      Games on a triangular grid are rarer, but they exist as well:
      <ul>
        <li>
          Colossal Citadels
          <Citation source="http://cartographer.cc/posts/triangular-grid/" />
        </li>
        <li>
          Blokus Trigon
          <Citation source="https://boardgamegeek.com/image/761381/blokus-trigon" />
        </li>
      </ul>
      <p className="text-center">
        <b>Why don't we have anything like this for 3D games?</b>
      </p>
      <h4>Math of grids</h4>
      <p>
        What we've been calling "grids" so far are instances of tessellations in mathematics.
      </p>
      <AsideCard title="Tessellations">
        <p>
          In math a <b>tessellation</b> is an arrangement of geometric shapes such that they fill the entire surface without any gaps or overlaps.
        </p>
        It's important to note that tessellations are a broad category. For instance:
        <ul>
          <li>The surface does not have to be Euclidean, we can tessellate hyperbolic space.</li>
          <li>We don't have to use polygons to tessellate, we can use curvy shapes.</li>
          <li>We don't have to repeat our pattern, we can make a tessellation which is not periodic.</li>
          <li>
            Tessellations can be in more than 2 dimensions, the cubic grid (also sometimes called the <b>cubic honeycomb</b>) is also an example of a tessellation.
            <ul>
              <li>
                Terminology Note: In general, any tessellation made of polyhedra in more than 2 dimensions is often called a <b>honeycomb</b>.
              </li>
            </ul>
          </li>
        </ul>
        <p>
          Examples of tessellations:
        </p>
        <div className="row my-3">
          <figure className="col text-center">
            <img alt="pentagonal tiling" className="d-block mx-auto" style={{ width: "15em" }} src={ChiralPentagonExample} />
            <figcaption><Attribution author="Tomruen" via="Wikimedia Commons" license={License.CC_BY_SA_4_0} href="https://commons.wikimedia.org/wiki/File:P5-type15-chiral_coloring.png" /></figcaption>
            <p>Pentagonal Tiling</p>
          </figure>
          <figure className="col text-center">
            <img alt="rhombitriheptagonal tiling" className="d-block mx-auto" style={{ width: "15em" }} src={H2TilingExample} />
            <figcaption><Attribution author="Parcly Taxel" via="Wikimedia Commons" license={License.PUBLIC_DOMAIN} href="https://commons.wikimedia.org/wiki/File:Rhombitriheptagonal_tiling.svg" /></figcaption>
            <p>Rhombitriheptagonal tiling of the hyperbolic plane</p>
          </figure>
          <figure className="col text-center">
            <img alt="cubic honeycomb" className="d-block mx-auto" style={{ width: "15em" }} src={CubicHoneycombExample} />
            <figcaption><Attribution author="Tomruen" via="Wikimedia Commons" license={License.PUBLIC_DOMAIN} href="https://commons.wikimedia.org/wiki/File:Cubic_honeycomb.png" /></figcaption>
            <p>Cubic Honeycomb</p>
          </figure>
        </div>
      </AsideCard>
      Since "tessellation" is an incredibly broad category, we need to assert some properties that will help us narrow down to the most useful and easy to use subset.
      <ul>
        <li>
          We only care about tessellations in Euclidean space.
          <ul>
            <li>
              Euclidean space is what we're used to using in the real world.
            </li>
            <li>
              It's also a lot easier to code than any other space (hyperbolic, spherical, etc.)
            </li>
          </ul>
        </li>
        <li>
          We want to use only one type of <b>regular polygon</b> to tessellate space.
          Regular polygons are polygons like the equilateral triangle and the square, where all angles and sides have the same length.
          <ul>
            <li>Tessellations of regular polygons are periodic, which makes it easier to code for, since we can make assumptions about things like how many neighbors a block has.</li>
            <li>Tessellations of regular polygons are symmetric, which, in addition to making coding easier, makes the world look more aesthetically pleasing.</li>
            <li>
              The 3D equivalent of a regular polygon is the <b>Platonic solid</b>. It requires:
              <ul>
                <li>Each face must be a regular polygon.</li>
                <li>Each face must be congruent to the other faces.</li>
                <li>Each vertex must have the same number of faces.</li>
              </ul>
            </li>
            <li>
              There are infinitely many regular polygons (triangle, square, pentagon, hexagon, heptagon, etc...), but there are only 5 Platonic solids.
            </li>

          </ul>
        </li>
      </ul>
      <p>
        The category of tessellations that satisfy these conditions are called <b>regular tessellations</b>.
        The hex, triangle, and square grids all are examples of 2D regular tessellations.
        The cubic honeycomb is an example of a 3D regular tessellation.
      </p>
      <h4>Regular Tessellations in N dimensions</h4>
      <p>
        Now we get to the basic reason why video games only use the cubic honeycomb: <b>There simply aren't any other options.</b>
      </p>
      <AsideCard title="Regular Tessellations by Dimension" >
        Here's a list of regular tessellations by dimension.
        <Citation source="https://en.wikipedia.org/wiki/Category:Regular_tessellations" />
        <ul>
          <li>
            2D
            <ul>
              <li>Square tiling</li>
              <li>Triangular tiling</li>
              <li>Hexagonal tiling</li>
            </ul>
          </li>
          <li>
            3D
            <ul>
              <li>Cubic honeycomb</li>
            </ul>
          </li>
          <li>
            4D
            <ul>
              <li>4-cubic (Tesseractic) honeycomb</li>
              <li>16-cell honeycomb</li>
              <li>24-cell honeycomb</li>
            </ul>
          </li>
          <li>
            5D
            <ul>
              <li>5-cubic honeycomb</li>
            </ul>
          </li>
          <li>
            6D
            <ul>
              <li>6-cubic honeycomb</li>
            </ul>
          </li>
          <li>
            7D
            <ul>
              <li>7-cubic honeycomb</li>
            </ul>
          </li>
          <li>
            8D
            <ul>
              <li>8-cubic honeycomb</li>
            </ul>
          </li>
        </ul>
      </AsideCard>
      <p>
        Inside 2 dimensions, we have our familiar square, triangular, and hexagonal tilings.
        But in 3 dimensions, we just have the cubic honeycomb.
        With the tight restrictions we specified earlier, it turns out there aren't any other options.
      </p>
      <p>
        Note that in 4D though, we have a similar situation as 2D.
        In addition to the cubic honeycomb, which appears in every dimension, we have two additional regular tessellations,
        the <a href="https://en.wikipedia.org/wiki/16-cell_honeycomb">16-cell honeycomb</a> and
        the <a href="https://en.wikipedia.org/wiki/24-cell_honeycomb">24-cell honeycomb</a>.
        These two honeycombs share another similarity with the 2D case, in that they are duals of each other.
      </p>
      <AsideCard title="Dual" >
        <p>
          In geometry, the <b>dual</b> of a tessellation is what we would get if we
          replaced the center of each polygon with a vertex and then drew a line between the vertexes if the original polygons were adjacent.
        </p>
        <p>
          It's easier to understand with a visual example:
        </p>
        <div className="row my-3">
          <figure className="col text-center">
            <img alt="dual of a hexagonal grid is a triangular grid" className="d-block mx-auto" style={{ width: "15em" }} src={DualExample} />
            <figcaption>Source: Own Work</figcaption>
            <p>The dual of the hexagonal tiling is the triangular tiling, and vice-versa.</p>
          </figure>
          <figure className="col text-center">
            <img alt="square grid is self-dual" className="d-block mx-auto" style={{ width: "15em" }} src={SelfDualExample} />
            <figcaption>Source: Own Work</figcaption>
            <p>The square tiling is it's own dual. (We call the square tiling <b>self-dual</b>)</p>
          </figure>
        </div>
      </AsideCard>
      <p>
        While it's tempting to think of the 16-cell and 24-cell honeycombs as higher dimensional analogue of the triangular and hexagonal tilings respectively,
        in the same way that the 4-cubic honeycomb is a higher dimensional analogue of the square tiling, this is actually incorrect.
        The higher dimensional analogue of the triangle is the <a href="https://en.wikipedia.org/wiki/5-cell">5-cell</a>, which can't be used to form a honeycomb in 4D.
        The <a href="">16-cell</a> is, in fact, the higher dimensional analogue of the <a href="https://en.wikipedia.org/wiki/Octahedron">octahedron</a>.
        As for the <a href="https://en.wikipedia.org/wiki/24-cell">24-cell</a>, it doesn't have a Platonic solid analogue.
        (Although it does have some other analogues, as we will see later.)<Citation source="https://en.wikipedia.org/wiki/24-cell" />.
      </p>
      <p>
        So, are there any applications of these 4D honeycombs to video games?
      </p>
      Well, not really, unless you're planning to make a 4D game, which is very cool, but pretty niche.
      Here's a list of cool 4D games.
      <ul>
        <li>
          Miegakure
          <Citation source="https://miegakure.com/" />
        </li>
        <li>
          4D Miner
          <Citation source="https://store.steampowered.com/app/1941640/4D_Miner/" /></li>
        <li>
          4D toys
          <Citation source="https://4dtoys.com/" />
        </li>
        <li><a href="https://en.wikipedia.org/wiki/List_of_four-dimensional_games">and others...</a></li>
      </ul>
      <h4>Space Filling Polyhedra</h4>
      <p>
        It's quite sad that we weren't able to find any regular polyhedra that can tessellate 3D space.
        However, what if we loosen the restrictions a bit?
        Let's say that we're fine with any convex polyhedron, even if it isn't regular.
      </p>
      <AsideCard title="Space Filling Polyhedra">
        <p>
          A <b>space filling polyhedron</b> is a polyhedron that can tessellate space using only translations, reflections, and rotations.
        </p>
        <p>
          Here's a partial list of space filling polyhedra and categories of space filling polyhedra taken from Wikipedia.<Citation source="https://en.wikipedia.org/wiki/Category:Space-filling_polyhedra" />
        </p>
        <ul style={{ columnCount: 2 }}>
          <li><a href="https://en.wikipedia.org/wiki/Cuboid">Cuboid</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Diminished rhombic dodecahedron">Diminished rhombic dodecahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Elongated dodecahedron">Elongated dodecahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Elongated gyrobifastigium">Elongated gyrobifastigium</a></li>
          <li><a href="https://en.wikipedia.org/wiki/First stellation of the rhombic dodecahedron">First stellation of the rhombic dodecahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Gyrobifastigium">Gyrobifastigium</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Hexagonal prism">Hexagonal prism</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Hill tetrahedron">Hill tetrahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Orthobifastigium">Orthobifastigium</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Parallelepiped">Parallelepiped</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Parallelohedron">Parallelohedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Plesiohedron">Plesiohedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Rhombic dodecahedron">Rhombic dodecahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Rhombohedron">Rhombohedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Stereohedron">Stereohedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Ten-of-diamonds decahedron">Ten-of-diamonds decahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Trapezo-rhombic dodecahedron">Trapezo-rhombic dodecahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Triakis truncated tetrahedron">Triakis truncated tetrahedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Triangular prism">Triangular prism</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Trigonal trapezohedron">Trigonal trapezohedron</a></li>
          <li><a href="https://en.wikipedia.org/wiki/Truncated octahedron">Truncated octahedron</a></li>
        </ul>
      </AsideCard>
      <p>
        There are quite a lot of space filling polyhedra, but I wanted to point out some of the more interesting ones.
      </p>
      <ul>
        <li>
          <h5>Prisms</h5>
          This class of objects include:
          <ul>
            <li><a href="https://en.wikipedia.org/wiki/Hexagonal prism">Hexagonal prism</a></li>
            <li><a href="https://en.wikipedia.org/wiki/Triangular prism">Triangular prism</a></li>
            <li><a href="https://en.wikipedia.org/wiki/Cuboid">Cuboid</a></li>
          </ul>
          <p>
            You can turn any 2D tiling of the plane into a 3D tiling by stretching it along the z axis.
            This is probably one of the easiest things to code into a game, and it's pretty practical to use.
          </p>
        </li>
        <li>
          <h5>Rhombic Dodecahedron</h5>
          <p>
            This is honestly one of the coolest non-regular polyhedra.
            It can be constructed by splitting up a cube into 6 pyranids and flipping them inside out and reattaching them.
            Each face is an identical rhombus.
          </p>
          <div className="row my-3">
            <figure className="col text-center">
              <img alt="rotating rhombic dodecahedron" className="d-block mx-auto bg-dark" style={{ width: "15em" }} src={RhombicDodecahedronGif} />
              <figcaption><Attribution author="Cyp" license={License.CC_BY_3_0} href="https://commons.wikimedia.org/wiki/File:Rhombicdodecahedron.gif" via="Wikimedia Commons" /></figcaption>
              <p>Rhombic Dodecahedron Rotating</p>
            </figure>
            <figure className="col text-center">
              <img alt="constructing a rhombic dodecahedron" className="d-block mx-auto" style={{ width: "15em" }} src={ConstructingRhombicDodecahedron} />
              <figcaption><Attribution author="TED-43" license={License.CC_BY_3_0} href="https://commons.wikimedia.org/wiki/File:R1-cube.gif" via="Wikimedia Commons" /></figcaption>
              <p>Constructing a Rhombic Dodecahedron</p>
            </figure>
            <figure className="col text-center">
              <img alt="rhombic dodecahedron honeycomb" className="d-block mx-auto" style={{ width: "15em" }} src={RhombicDodecahedra} />
              <figcaption><Attribution author="AndrewKepert" license={License.CC_BY_3_0} href="https://commons.wikimedia.org/wiki/File:Rhombic_dodecahedra.png" via="Wikimedia Commons" /></figcaption>
              <p>Rhombic Dodecahedron Honeycomb</p>
            </figure>
          </div>
          The rhombic dodecahedron has several symmetries:
          <ul>
            <li>
              It's <b>face-transitive</b>
              <ul>
                <li>
                  If I have a source face <TeX>A</TeX> and a target face <TeX>B</TeX>,
                  I can perform a series of rotations and reflections on the polyhedron so that <TeX>A</TeX> ends up where <TeX>B</TeX> used to be,
                  and the the polyhedron occpies the same region of space in both the starting and ending configurations.
                  <Citation source="https://en.wikipedia.org/wiki/Isohedral_figure" />
                </li>
                <li>
                  Any polyhedron that is face transitive can be used as a fair die.
                </li>
              </ul>
            </li>
            <li>
              It's <b>edge-transitive</b>
              <ul>
                <li>
                  If I have a source edge <TeX>A</TeX> and a target edge <TeX>B</TeX>,
                  I can perform a series of rotations and reflections on the polyhedron so that <TeX>A</TeX> ends up where <TeX>B</TeX> used to be,
                  and the the polyhedron occpies the same region of space in both the starting and ending configurations.
                  <Citation source="https://en.wikipedia.org/wiki/Isotoxal_figure" />
                </li>
              </ul>
            </li>
          </ul>
          However, it's also definitely not a Platonic solid:
          <ul className="mb-3">
            <li>It's not <b>vertex-transitive</b>. Some vertexes have 4 adjacent faces, and others have 6 adjacent faces.</li>
            <li>Its faces aren't regular polygons, they're rhombuses.</li>
          </ul>
          <p>
            We mentioned earlier that the 24-cell had 3D analogues, but that they were nonregular.
            One of those turns out to be the rhombic dodecahedron!
          </p>
          <p>
            Even though the rhombic dodecahedron isn't a Platonic solid, it's higher dimensional analogue is.
            Just like the rhombic dodecahedron, the 24-cell can be constructed by cutting up the 4-cube (or tesseract)
            into pyramidal pieces and turning them inside out.
          </p>
        </li>
      </ul>
    </Section>
    <Section id="conclusion" name="Conclusion">
      <h4>Summary</h4>
      <p>
        While it's not possible to use any other Platonic solid than a cube as a voxel,
        it's definitely possible to use one of the other space filling polyhedra as a voxel.
      </p>
      The main reason developers haven't done it yet is mostly due to reasons of convenience.
      Cubes are incredibly easy to work with:
      <ul>
        <li>The axes are orthogonal.</li>
        <li>You can represent the cube grid in a simple multi-dimensional array.</li>
        <li>The neighbors of each cube are easy to compute (just add or subtract one from one of the axes).</li>
        <li>Any point on the grid can be represented Cartesian coordinates.</li>
      </ul>
      <h4>Should I Use Noncubic Voxels?</h4>
      <p>
        Most likely not, unless you really want to for some reason.
        Noncubic voxels are kind of a pain.
      </p>
    </Section>
    <Section id="sources" name="Sources">
      <CitationBank />
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
    <WhyVoxelsPage />
  </React.StrictMode>,
);
